import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

declare global {
  interface Window {
    kakao: any;
  }
}

type Address = {
  id: number;
  address: string;
  memo: string;
  username: string;
  created_at: string;
  user_id: number;
};

type Props = {
  addresses: Address[];
  selectedAddress: Address | null;
};

type DisasterMessage = {
  일련번호: string;
  생성일시: string;
  내용: string;
  지역: string;
};

type GeocoderResult = {
  y: string;
  x: string;
  road_address: any;
  address: {
    region_1depth_name: string; // 시/도
    region_2depth_name: string; // 시/군/구
  } | null;
}[];

type Facility = {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: string;
};

const MapView = ({ addresses, selectedAddress }: Props) => {
  const mapRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  const addressMarkersRef = useRef<Map<number, { marker: any; infowindow: any; type: 'my' | 'other' }>>(new Map());
  const facilityMarkersRef = useRef<{ marker: any; infowindow: any }[]>([]);
  
  const openInfoRef = useRef<{ marker: any; infowindow: any } | null>(null);

  const [disasterMessages, setDisasterMessages] = useState<DisasterMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentRegion, setCurrentRegion] = useState<string>("");
  const [facilities, setFacilities] = useState<Facility[]>([]);

  const [showMyMarkers, setShowMyMarkers] = useState(true);
  const [showOtherMarkers, setShowOtherMarkers] = useState(true);
  const [showFacilities, setShowFacilities] = useState(true);

  // 지도 및 마커 '생성'
  useEffect(() => {
    const loadMap = () => {
      const { kakao } = window;
      const container = mapContainerRef.current;
      if (!container) return;

      const map = new kakao.maps.Map(container, {
        center: new kakao.maps.LatLng(35.1796, 129.0756),
        level: 5,
      });
      const geocoder = new kakao.maps.services.Geocoder();
      mapRef.current = map;
      geocoderRef.current = geocoder;

      // 이전 마커 및 인포윈도우 정리
      addressMarkersRef.current.forEach(item => item.marker.setMap(null));
      addressMarkersRef.current.clear();
      facilityMarkersRef.current.forEach(item => item.marker.setMap(null));
      facilityMarkersRef.current = [];
      
      if (openInfoRef.current) {
        openInfoRef.current.infowindow.close();
        openInfoRef.current = null;
      }

      // 주소 마커 생성
      const myUserId = Number(localStorage.getItem('userId'));
      addresses.forEach((addr) => {
        geocoder.addressSearch(addr.address, (result: any, status: any) => {
          if (status === kakao.maps.services.Status.OK) {
            const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
            const markerType = addr.user_id !== 1 ? 'other' : 'my';
            let marker: any;

            if (markerType === 'other') {
              const imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png';
              const imageSize = new kakao.maps.Size(64, 69);
              const imageOption = { offset: new kakao.maps.Point(27, 69) };
              const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
              marker = new kakao.maps.Marker({ position: coords, image: markerImage });
            } else {
              marker = new kakao.maps.Marker({ position: coords });
            }
            
            const infowindow = new kakao.maps.InfoWindow({
              removable: true,
              content: `<div style="padding:8px;font-size:14px;color:#333;line-height:1.4;max-width:240px;white-space:normal;overflow-wrap:break-word;"><div style="font-weight:bold;margin-bottom:4px;">${addr.address}</div><div>${addr.memo.replace(/\r\n|\n/g, "<br/>")}</div></div>`,
            });
            
            kakao.maps.event.addListener(marker, "click", () => {
              if (openInfoRef.current) openInfoRef.current.infowindow.close();
              infowindow.open(map, marker);
              openInfoRef.current = { marker, infowindow };
            });
            
            addressMarkersRef.current.set(addr.id, { marker, infowindow, type: markerType });

            const isVisible = (markerType === 'my' && showMyMarkers) || (markerType === 'other' && showOtherMarkers);
            marker.setMap(isVisible ? map : null);
          }
        });
      });

      // 시설 마커 생성
      const newFacilityMarkers: { marker: any; infowindow: any }[] = [];
      facilities.forEach((fac) => {
        if (fac.type !== 'fire' && fac.type !== 'medical') return;

        const pos = new kakao.maps.LatLng(fac.lat, fac.lng);
        let imageSrc = fac.type === 'fire' ? '/fire-truck.png' : '/hospital.png';
        const markerImage = new kakao.maps.MarkerImage(
          imageSrc,
          new kakao.maps.Size(44, 49),
          { offset: new kakao.maps.Point(22, 49) }
        );

        // 마커 생성 시점에 바로 지도에 표시/숨김 처리
        const marker = new kakao.maps.Marker({
            position: pos,
            image: markerImage,
            map: showFacilities ? map : null
        });

        const infowindow = new kakao.maps.InfoWindow({
          removable: true,
          content: `<div style="padding: 8px; font-size: 14px;"><div style="font-weight:bold; margin-bottom:4px;">${fac.name}</div><div>${fac.address}</div></div>`
        });
        
        kakao.maps.event.addListener(marker, "click", () => {
          if (openInfoRef.current) openInfoRef.current.infowindow.close();
          infowindow.open(map, marker);
          openInfoRef.current = { marker, infowindow };
        });

        newFacilityMarkers.push({ marker, infowindow });
      });
      facilityMarkersRef.current = newFacilityMarkers;
    };

    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(loadMap);
    } else {
      const script = document.createElement("script");
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_API_KEY}&libraries=services`;
      script.async = true;
      script.onload = () => window.kakao.maps.load(loadMap);
      document.head.appendChild(script);
    }
  }, [addresses, facilities]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    addressMarkersRef.current.forEach(item => {
      const isVisible = (item.type === 'my' && showMyMarkers) || (item.type === 'other' && showOtherMarkers);
      item.marker.setMap(isVisible ? map : null);
    });

    facilityMarkersRef.current.forEach(item => {
      item.marker.setMap(showFacilities ? map : null);
    });
    
    if (openInfoRef.current) {
      const associatedMarker = openInfoRef.current.marker;
      if (associatedMarker && associatedMarker.getMap() === null) {
        openInfoRef.current.infowindow.close();
        openInfoRef.current = null;
      }
    }
  }, [showMyMarkers, showOtherMarkers, showFacilities]);

  // 선택된 주소 위치로 이동
  useEffect(() => {
    if (selectedAddress && geocoderRef.current && mapRef.current) {
      geocoderRef.current.addressSearch(
        selectedAddress.address,
        (result: any, status: any) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
            mapRef.current.setCenter(coords);
            mapRef.current.setLevel(5, { animate: true });

            const entry = addressMarkersRef.current.get(selectedAddress.id);
            if (entry && entry.marker.getMap()) {
              if (openInfoRef.current) openInfoRef.current.infowindow.close();
              entry.infowindow.open(mapRef.current, entry.marker);
              openInfoRef.current = { marker: entry.marker, infowindow: entry.infowindow };
            }
          }
        }
      );
    }
  }, [selectedAddress]);
  
  // 재난문자 가져오기 및 지도 idle 이벤트 연결
  useEffect(() => {
    const map = mapRef.current;
    const geocoder = geocoderRef.current;
    if (!map || !geocoder) return;

    const fetchDisasterMessages = async (
      displayName: string,
      searchRegion: string
    ) => {
      const serviceKey = process.env.REACT_APP_DISASTER_ALARM_API_KEY;
      if (!serviceKey) {
        alert("재난 문자 서비스 키(.env)가 설정되지 않았습니다.");
        return;
      }

      setIsLoading(true);
      setCurrentRegion(displayName);

      try {
        const proxyUrl = "https://thingproxy.freeboard.io/fetch/";
        const targetApiUrl = "https://www.safetydata.go.kr/V2/api/DSSP-IF-00247";

        const firstParams = new URLSearchParams({
          serviceKey,
          pageNo: "1",
          numOfRows: "1",
          type: "json",
          rgnNm: searchRegion,
        }).toString();
        const firstRes = await axios.get(`${proxyUrl}${targetApiUrl}?${firstParams}`);
        const totalCount = firstRes.data?.totalCount;

        if (!totalCount || totalCount === 0) {
          setDisasterMessages([]);
          setIsLoading(false);
          return;
        }

        const numOfRows = 100;
        const lastPageNo = Math.ceil(totalCount / numOfRows);
        const lastParams = new URLSearchParams({
          serviceKey,
          pageNo: lastPageNo.toString(),
          numOfRows: numOfRows.toString(),
          type: "json",
          rgnNm: searchRegion,
        }).toString();
        const lastRes = await axios.get(`${proxyUrl}${targetApiUrl}?${lastParams}`);
        const msgs: any[] = lastRes.data?.body || [];

        const allMessages = msgs.map((msg) => ({
          일련번호: msg.SN,
          생성일시: msg.CRT_DT,
          내용: msg.MSG_CN,
          지역: msg.RPTN_RGN_NM,
        })).reverse();

        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        const recent = allMessages.filter((m) => {
          if (!m.생성일시) return false;
          return new Date(m.생성일시) >= threeDaysAgo;
        });

        setDisasterMessages(recent);
      } catch (err) {
        console.error("재난 문자 API 호출 실패:", err);
        alert("재난 문자 정보를 불러오는 데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    const onMapIdle = () => {
      const center = map.getCenter();
      geocoder.coord2Address(
        center.getLng(),
        center.getLat(),
        (result: GeocoderResult, status: any) => {
          if (status === window.kakao.maps.services.Status.OK && result[0].address) {
            const region = result[0].address;
            const displayName = `${region.region_1depth_name} ${region.region_2depth_name}`;
            const searchKey = region.region_1depth_name;
            if (currentRegion !== displayName) {
              fetchDisasterMessages(displayName, searchKey);
            }
          }
        }
      );
    };

    onMapIdle();
    window.kakao.maps.event.addListener(map, "idle", onMapIdle);
    return () => {
      window.kakao.maps.event.removeListener(map, "idle", onMapIdle);
    };
  }, [addresses, currentRegion]);

  // 시설 데이터 fetch
  useEffect(() => {
    axios
      .get('http://127.0.0.1:8000/facilities')
      .then(res => setFacilities(res.data))
      .catch(err => {
        console.error('시설 정보 불러오기 실패:', err);
      });
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* 카카오 맵 컨테이너 */}
      <div id="map" ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />

      {/* 마커 토글 체크박스 UI */}
      <div className="absolute top-12 left-3 bg-white bg-opacity-80 p-3 rounded-lg shadow-lg z-10 text-sm">
        <h4 className="font-bold mb-2 pb-1 border-b border-gray-400">마커 필터</h4>
        <div className="space-y-1 mt-2">
          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showFacilities}
                onChange={() => setShowFacilities(prev => !prev)}
                className="mr-2 h-4 w-4"
              />
              <span>주변 병원/소방서</span>
            </label>
          </div>
          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showMyMarkers}
                onChange={() => setShowMyMarkers(prev => !prev)}
                className="mr-2 h-4 w-4"
              />
              <span>부산광역시 지정 인명피해 우려지역</span>
            </label>
          </div>
          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showOtherMarkers}
                onChange={() => setShowOtherMarkers(prev => !prev)}
                className="mr-2 h-4 w-4"
              />
              <span>수기 등록 위험 지역</span>
            </label>
          </div>
        </div>
      </div>

      {/* 재난문자 팝업 */}
      <div className="absolute top-12 right-3 w-full max-w-sm bg-black bg-opacity-75 text-white p-4 rounded-lg shadow-lg z-10">
        <h3 className="font-bold text-lg border-b border-gray-500 pb-2 mb-2">
          {currentRegion ? `${currentRegion} 재난 문자` : "현재 지역 재난 문자"}
        </h3>
        <div className="overflow-y-auto h-48 pr-2">
          {isLoading ? (
            <p className="text-center">불러오는 중...</p>
          ) : disasterMessages.length > 0 ? (
            <ul className="space-y-3">
              {disasterMessages.map((msg) => (
                <li key={msg.일련번호} className="text-sm">
                  <p className="font-semibold">{msg.내용}</p>
                  <p className="text-xs text-gray-300 text-right">{msg.생성일시}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-400">최근 3일간 재난 문자가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;