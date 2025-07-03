// src/types/BlockData.ts
export interface BlockData {
  block_lat: number;
  block_lon: number;
  total_buildings: number;
  old_buildings: number;
  old_ratio: number;
  center_lat: number;
  center_lon: number;
  color: 'red' | 'yellow' | 'green';
}

// 카카오 맵 오버레이 타입을 위해 추가 (Optional)
type KakaoMapRectangle = any; // kakao.maps.Rectangle의 실제 타입이 복잡하므로 간단히 any로 처리
type KakaoMapInfoWindow = any; // kakao.maps.InfoWindow의 실제 타입이 복잡하므로 간단히 any로 처리

export type BlockOverlay = {
  rectangle: KakaoMapRectangle;
  infowindow: KakaoMapInfoWindow;
};