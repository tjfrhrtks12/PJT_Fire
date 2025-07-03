// src/components/OldBuildingBlocksMap.tsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import Papa from "papaparse";
import { BlockData, BlockOverlay } from '../types/BlockData';

declare global {
  interface Window {
    kakao: any;
  }
}

// 부산시 구 목록 (각 파일이 특정 '구'의 데이터라고 가정)
// 'processed_block_data.csv'는 기본값으로 표시할 특정 구 (예: 강서구)의 데이터라고 가정합니다.
const BUSAN_GU_LIST = [
  { name: "연제구", filename: "yeonjegu_data.csv" }, // 기본값으로 로드될 파일
  { name: "북구", filename: "bukgu_data.csv" },
  { name: "부산진구", filename: "busanjingu_data.csv" },
  { name: "동구", filename: "donggu_data.csv" },
  { name: "동래구", filename: "dongnaegu_data.csv" },
  { name: "금정구", filename: "geumjeonggu_data.csv" },
  { name: "기장군", filename: "gijanggun_data.csv" },
  { name: "해운대구", filename: "haeundaegu_data.csv" },
  { name: "중구", filename: "junggu_data.csv" },
  { name: "남구", filename: "namgu_data.csv" },
  { name: "사하구", filename: "sahagu_data.csv" },
  { name: "사상구", filename: "sasanggu_data.csv" },
  { name: "서구", filename: "seogu_data.csv" },
  { name: "수영구", filename: "suyeonggu_data.csv" },
  { name: "영도구", filename: "yeongdogu_data.csv" },
];

const OldBuildingBlocksMap: React.FC = () => {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const blockOverlaysRef = useRef<BlockOverlay[]>([]);
  const openInfoWindowRef = useRef<any>(null);

  const [blockData, setBlockData] = useState<BlockData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGu, setSelectedGu] = useState<string>(BUSAN_GU_LIST[0].name);

  // --- 1. CSV 데이터 로드 및 파싱 함수 ---
  const fetchBlockCsvData = useCallback(async (filename: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/${filename}`);
      if (!response.ok) {
        throw new Error(`CSV 파일을 불러오는 데 실패했습니다: ${response.statusText} (${filename})`);
      }
      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsedData: BlockData[] = results.data.map((row: any) => ({
            block_lat: parseFloat(row.block_lat),
            block_lon: parseFloat(row.block_lon),
            total_buildings: parseInt(row.total_buildings, 10),
            old_buildings: parseInt(row.old_buildings, 10),
            old_ratio: parseFloat(row.old_ratio),
            center_lat: parseFloat(row.center_lat),
            center_lon: parseFloat(row.center_lon),
            color: row.color as 'red' | 'yellow' | 'green',
          })).filter(block => !isNaN(block.block_lat) && !isNaN(block.block_lon) && block.block_lat !== 0 && block.block_lon !== 0);
          
          setBlockData(parsedData);
          setLoading(false);
        },
        // error: (err: PapaParse.ParseError) => {
        //   setError(`CSV 파싱 중 오류 발생: ${err.message}`);
        //   setLoading(false);
        // }
      });

    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(`블록 데이터 로드 중 오류 발생: ${e.message}`);
      } else {
        setError('알 수 없는 오류로 블록 데이터 로드 실패');
      }
      setLoading(false);
    }
  }, []);

  // --- 2. 카카오 맵 SDK 로드 로직 ---
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) {
      const script = document.createElement("script");
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_API_KEY}&libraries=services,clusterer,drawing`;
      script.async = true;
      script.onload = () => {
        console.log("Kakao Maps SDK loaded.");
        const initialGuInfo = BUSAN_GU_LIST.find(gu => gu.name === selectedGu);
        if (initialGuInfo) {
            fetchBlockCsvData(initialGuInfo.filename);
        }
      };
      script.onerror = (err) => {
        console.error("Kakao Maps SDK 로드 실패:", err);
        setError("지도 SDK를 불러오는 데 실패했습니다. API 키를 확인해주세요.");
      };
      document.head.appendChild(script);
    } else {
      console.log("Kakao Maps SDK already loaded.");
      const initialGuInfo = BUSAN_GU_LIST.find(gu => gu.name === selectedGu);
      if (initialGuInfo) {
          fetchBlockCsvData(initialGuInfo.filename);
      }
    }
  }, []);

  // --- 3. 선택된 구 변경 시 데이터 로드 ---
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps || !mapRef.current) return;

    const currentGuInfo = BUSAN_GU_LIST.find(gu => gu.name === selectedGu);
    if (currentGuInfo) {
      fetchBlockCsvData(currentGuInfo.filename);
    }
  }, [selectedGu, fetchBlockCsvData]);

  // --- 4. 카카오 맵 초기화 및 블록 오버레이 그리기 ---
  useEffect(() => {
    if (loading || error || blockData.length === 0) return;
    
    const { kakao } = window;
    const container = mapContainerRef.current;
    if (!container) return;

    if (mapRef.current) {
      if (openInfoWindowRef.current) {
        openInfoWindowRef.current.close();
        openInfoWindowRef.current = null;
      }
      blockOverlaysRef.current.forEach(item => {
        if (item.rectangle) item.rectangle.setMap(null);
        if (item.infowindow) item.infowindow.close();
      });
      blockOverlaysRef.current = [];
      container.innerHTML = '';
    }
    
    const map = new kakao.maps.Map(container, {
      center: new kakao.maps.LatLng(blockData[0].center_lat, blockData[0].center_lon),
      level: 5,
    });
    mapRef.current = map;

    const BLOCK_SIZE_LATITUDE = 0.001;
    const BLOCK_SIZE_LONGITUDE = 0.001;

    const newBlockOverlays: BlockOverlay[] = [];
    blockData.forEach(block => {
      const sw = new kakao.maps.LatLng(block.block_lat, block.block_lon);
      const ne = new kakao.maps.LatLng(block.block_lat + BLOCK_SIZE_LATITUDE, block.block_lon + BLOCK_SIZE_LONGITUDE);
      const bounds = new kakao.maps.LatLngBounds(sw, ne);

      const rectangle = new kakao.maps.Rectangle({
        bounds: bounds,
        strokeWeight: 1,
        strokeColor: '#000000',
        strokeOpacity: 0.5,
        strokeStyle: 'solid',
        fillColor: block.color,
        fillOpacity: 0.3
      });
      
      rectangle.setMap(map);

      const infowindow = new kakao.maps.InfoWindow({
        removable: true,
        content: `
          <div style="padding:8px;font-size:13px;color:#333;line-height:1.4;max-width:200px;white-space:normal;overflow-wrap:break-word;">
            <div style="font-weight:bold;margin-bottom:4px;">노후 건물 비율</div>
            <div>총 건물: ${block.total_buildings}개</div>
            <div>노후 건물: ${block.old_buildings}개</div>
            <div>비율: ${block.old_ratio.toFixed(2)}%</div>
          </div>`
      });

      kakao.maps.event.addListener(rectangle, 'click', () => {
        if (openInfoWindowRef.current) {
          openInfoWindowRef.current.close();
        }
        infowindow.open(map, rectangle.getBounds().getCenter());
        openInfoWindowRef.current = infowindow;
      });

      newBlockOverlays.push({ rectangle, infowindow });
    });
    blockOverlaysRef.current = newBlockOverlays;

    if (blockData.length > 0) {
      const bounds = new kakao.maps.LatLngBounds();
      blockData.forEach(block => {
        bounds.extend(new kakao.maps.LatLng(block.block_lat, block.block_lon));
        bounds.extend(new kakao.maps.LatLng(block.block_lat + BLOCK_SIZE_LATITUDE, block.block_lon + BLOCK_SIZE_LONGITUDE));
      });
      map.setBounds(bounds);
    }

    return () => {
      blockOverlaysRef.current.forEach(item => {
        if (item.rectangle) item.rectangle.setMap(null);
        if (item.infowindow) item.infowindow.close();
      });
      blockOverlaysRef.current = [];

      if (openInfoWindowRef.current) {
        openInfoWindowRef.current.close();
        openInfoWindowRef.current = null;
      }
      
      if (container) {
          container.innerHTML = '';
      }
      mapRef.current = null;
    };

  }, [blockData, loading, error]);

  const handleGuChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGu(event.target.value);
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '20px' }}>건물 노후화 블록 데이터 로딩 중...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>오류 발생: {error}</div>;
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '700px', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: 'rgba(255,255,255,0.9)', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', zIndex: 10 }}>
        <label htmlFor="gu-select" style={{ marginRight: '10px', fontWeight: 'bold' }}>구 선택:</label>
        <select id="gu-select" value={selectedGu} onChange={handleGuChange}
                style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}>
          {BUSAN_GU_LIST.map((gu) => (
            <option key={gu.name} value={gu.name}>
              {gu.name}
            </option>
          ))}
        </select>
      </div>

      <div id="block-map-container" ref={mapContainerRef} style={{ flexGrow: 1, height: '100%', width: '100%' }} />
    </div>
  );
};

export default OldBuildingBlocksMap;