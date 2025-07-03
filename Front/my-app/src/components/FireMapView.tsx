// components/FireMapView.tsx
import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    kakao: any;
  }
}

type FireAddress = {
  id: number;
  address: string;
  memo: string;
  username: string;
  created_at: string;
  user_id: number;
};

type FireStation = {
  id: number;
  name: string;
  address: string;
  type: string;
};

type Props = {
  fireAddresses: FireAddress[];
  selectedId: number | null;
  fireStations: FireStation[];
};

const FireMapView = ({ fireAddresses, selectedId, fireStations }: Props) => {
  const mapRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const markerMap = useRef<Map<number, any>>(new Map());
  const infoWindowMap = useRef<Map<number, any>>(new Map());

  // ✅ 지도 로딩 및 마커 생성
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

      const myUserId = Number(localStorage.getItem("userId"));

      // ✅ 이전 마커들 초기화
      markerMap.current.clear();
      infoWindowMap.current.clear();

      fireAddresses.forEach((addr) => {
        geocoder.addressSearch(addr.address, (result: any, status: any) => {
          if (status === kakao.maps.services.Status.OK) {
            const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
            const markerType = addr.user_id === myUserId ? "my" : "other";

            let marker: any;
            if (markerType === "other" || markerType === "my") {
              const imageSrc = "/Fire.png";
              const imageSize = new kakao.maps.Size(34, 42);
              const imageOption = { offset: new kakao.maps.Point(27, 69) };
              const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
              marker = new kakao.maps.Marker({ position: coords, image: markerImage });
            } else {
              marker = new kakao.maps.Marker({ position: coords });
            }

            marker.setMap(map);

            const infowindow = new kakao.maps.InfoWindow({
              removable: true,
              content: `
                <div style="padding:8px;font-size:14px;max-width:240px;white-space:normal;">
                  <div style="font-weight:bold;margin-bottom:4px;">${addr.address}</div>
                  <div>${addr.memo.replace(/\n/g, "<br/>")}</div>
                  <div style="font-size:12px;color:gray;margin-top:4px;">작성자: ${addr.username}</div>
                </div>`,
            });

            kakao.maps.event.addListener(marker, "click", () => {
              infowindow.open(map, marker);
            });

            // ✅ 마커/인포윈도우 저장
            markerMap.current.set(addr.id, marker);
            infoWindowMap.current.set(addr.id, infowindow);
          }
        });
      });

      // 소방서 마커 추가
      fireStations.forEach((station) => {
        geocoder.addressSearch(station.address, (result: any, status: any) => {
          if (status === kakao.maps.services.Status.OK) {
            const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
            const imageSrc = "/fire-truck.png";
            const imageSize = new kakao.maps.Size(24, 24);
            const imageOption = { offset: new kakao.maps.Point(12, 24) };
            const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
            const marker = new kakao.maps.Marker({ position: coords, image: markerImage });
            marker.setMap(map);
            const infowindow = new kakao.maps.InfoWindow({
              removable: true,
              content: `<div style="padding:8px;font-size:14px;max-width:240px;white-space:normal;">
                <div style="font-weight:bold;margin-bottom:4px;">${station.name}</div>
                <div>${station.address}</div>
              </div>`
            });
            kakao.maps.event.addListener(marker, "click", () => {
              infowindow.open(map, marker);
            });
          }
        });
      });
    };

    // 스크립트 로딩
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(loadMap);
    } else {
      const script = document.createElement("script");
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_API_KEY}&libraries=services&autoload=false`;
      script.async = true;
      script.onload = () => window.kakao.maps.load(loadMap);
      document.head.appendChild(script);
    }
  }, [fireAddresses, fireStations]);

  // ✅ 선택된 주소 ID → 지도 이동 + InfoWindow 열기
  useEffect(() => {
    if (!selectedId || !mapRef.current) return;

    const marker = markerMap.current.get(selectedId);
    const infowindow = infoWindowMap.current.get(selectedId);

    if (marker && infowindow) {
      mapRef.current.panTo(marker.getPosition());
      infowindow.open(mapRef.current, marker);
    }
  }, [selectedId]);

  return <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />;
};

export default FireMapView;