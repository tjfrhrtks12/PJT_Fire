import React, { useEffect, useRef } from "react";

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
};

type Props = {
  addresses: Address[];
  selectedAddress: Address | null;
};

const MapView = ({ addresses, selectedAddress }: Props) => {
  const mapRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerMapRef = useRef<Map<number, { marker: any, infowindow: any }>>(new Map());
  const openInfoRef = useRef<any>(null);

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

      addresses.forEach((addr) => {
        geocoder.addressSearch(addr.address, (result: any, status: any) => {
          if (status === kakao.maps.services.Status.OK) {
            const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
            const marker = new kakao.maps.Marker({ map, position: coords });

            const formattedMemo = addr.memo.replace(/\r\n|\r|\n/g, "<br/>");

            const infowindow = new kakao.maps.InfoWindow({
              content: `<div style="
                padding:10px;
                font-size:14px;
                line-height:1.5;
                min-width:220px;
                max-width:300px;
                white-space:normal;
                word-break:break-word;
              ">
                <strong>${addr.address}</strong><br/>
                ${formattedMemo}
              </div>`
            });

            kakao.maps.event.addListener(marker, "click", () => {
              if (openInfoRef.current) openInfoRef.current.close();
              infowindow.open(map, marker);
              openInfoRef.current = infowindow;
              map.panTo(coords);
            });

            markerMap.set(addr.id, { marker, infowindow });
          }
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
  }, [addresses]);

  useEffect(() => {
    if (selectedAddress && geocoderRef.current && mapRef.current) {
      geocoderRef.current.addressSearch(selectedAddress.address, (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
          mapRef.current.setCenter(coords);

          const entry = markerMapRef.current.get(selectedAddress.id);
          if (entry) {
            if (openInfoRef.current) openInfoRef.current.close();
            entry.infowindow.open(mapRef.current, entry.marker);
            openInfoRef.current = entry.infowindow;
          }
        }
      });
    }
  }, [selectedAddress]);

  return <div id="map" ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />;
};

export default MapView;
