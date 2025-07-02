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
  const markerMapRef = useRef<Map<number, { marker: any; infowindow: any }>>(
    new Map()
  );
  const openInfoRef = useRef<any>(null);

  const [disasterMessages, setDisasterMessages] = useState<DisasterMessage[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentRegion, setCurrentRegion] = useState<string>("");
  const [facilities, setFacilities] = useState<Facility[]>([]);

  // 지도 및 마커 초기화
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

      const markerMap = new Map();
      const myUserId = Number(localStorage.getItem('userId'));

      // 주소 마커
      addresses.forEach((addr) => {
        geocoder.addressSearch(addr.address, (result: any, status: any) => {
          if (status === kakao.maps.services.Status.OK) {
            const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
            let marker: any;
            if (addr.user_id !== 1) {
              const imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png';
              const imageSize = new kakao.maps.Size(64, 69);
              const imageOption = { offset: new kakao.maps.Point(27, 69) };
              const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
              marker = new kakao.maps.Marker({ map, position: coords, image: markerImage });
            } else {
              marker = new kakao.maps.Marker({ map, position: coords });
            }
            const infowindow = new kakao.maps.InfoWindow({
              removable: true,
              content: `
                <div style="
                  padding:8px;
                  font-size:14px;
                  color:#333;
                  line-height:1.4;
                  max-width:240px;
                  white-space: normal;
                  overflow-wrap: break-word;
                ">
                  <div style="font-weight:bold; margin-bottom:4px;">
                    ${addr.address}
                  </div>
                  <div>
                    ${addr.memo.replace(/\r\n|\n/g, "<br/>")}
                  </div>
                </div>
              `,
            });
            kakao.maps.event.addListener(marker, "click", () => {
              if (openInfoRef.current) openInfoRef.current.close();
              infowindow.open(map, marker);
              openInfoRef.current = infowindow;
            });
            markerMap.set(addr.id, { marker, infowindow });
          }
        });
      });

      // 시설 마커 (소방서/병원)
      facilities.forEach((fac) => {
        if (fac.type !== 'fire' && fac.type !== 'medical') return; // fire/medical만 마커 생성
        const pos = new kakao.maps.LatLng(fac.lat, fac.lng);
        let imageSrc = fac.type === 'fire' ? '/fire-truck.png' : '/hospital.png';
        const markerImage = new kakao.maps.MarkerImage(
          imageSrc,
          new kakao.maps.Size(44, 49),
          { offset: new kakao.maps.Point(22, 49) }
        );
        const marker = new kakao.maps.Marker({ map, position: pos, image: markerImage });
        const infowindow = new kakao.maps.InfoWindow({
          removable: true,
          content: `
            <div style="font-weight:bold; margin-bottom:4px;">${fac.name}</div>
            <div>${fac.address}</div>
          `
        });
        kakao.maps.event.addListener(marker, "click", () => {
          if (openInfoRef.current) openInfoRef.current.close();
          infowindow.open(map, marker);
          openInfoRef.current = infowindow;
        });
      });

      markerMapRef.current = markerMap;
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

  // 선택된 주소 위치로 이동
  useEffect(() => {
    if (selectedAddress && geocoderRef.current && mapRef.current) {
      geocoderRef.current.addressSearch(
        selectedAddress.address,
        (result: any, status: any) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const coords = new window.kakao.maps.LatLng(
              result[0].y,
              result[0].x
            );
            mapRef.current.setCenter(coords);
            mapRef.current.setLevel(5, { animate: true });

            const entry = markerMapRef.current.get(selectedAddress.id);
            if (entry) {
              if (openInfoRef.current) openInfoRef.current.close();
              entry.infowindow.open(mapRef.current, entry.marker);
              openInfoRef.current = entry.infowindow;
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

        // 먼저 총 개수 조회
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

        // 마지막 페이지 호출
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

        // 최근 3일 필터
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

    // 초기 한 번
    onMapIdle();
    // idle 이벤트 리스너
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
