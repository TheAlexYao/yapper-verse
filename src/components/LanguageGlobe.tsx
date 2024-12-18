import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from './ui/button';
import { toast } from './ui/use-toast';

interface Language {
  name: string;
  location: [number, number];
  country: string;
}

const languages: Language[] = [
  { name: "English", location: [-0.1276, 51.5074], country: "UK" },
  { name: "Mandarin", location: [116.4074, 39.9042], country: "China" },
  { name: "Cantonese", location: [114.1694, 22.3193], country: "Hong Kong" },
  { name: "Spanish (Mexico)", location: [-99.1332, 19.4326], country: "Mexico" },
  { name: "Spanish (Spain)", location: [-3.7038, 40.4168], country: "Spain" },
  { name: "French (France)", location: [2.3522, 48.8566], country: "France" },
  { name: "French (Canada)", location: [-73.5673, 45.5017], country: "Canada" },
  { name: "Portuguese (Brazil)", location: [-47.8645, -15.7942], country: "Brazil" },
  { name: "Portuguese (Portugal)", location: [-9.1393, 38.7223], country: "Portugal" },
  { name: "Japanese", location: [139.6917, 35.6895], country: "Japan" },
  { name: "Korean", location: [126.9780, 37.5665], country: "South Korea" },
  { name: "Hindi", location: [77.2090, 28.6139], country: "India" },
  { name: "Tamil", location: [80.2707, 13.0827], country: "India" },
  { name: "Thai", location: [100.5018, 13.7563], country: "Thailand" },
  { name: "Vietnamese", location: [105.8342, 21.0285], country: "Vietnam" },
  { name: "Malay", location: [101.6869, 3.1390], country: "Malaysia" },
  { name: "German", location: [13.4050, 52.5200], country: "Germany" },
  { name: "Russian", location: [37.6173, 55.7558], country: "Russia" },
  { name: "Italian", location: [12.4964, 41.9028], country: "Italy" },
  { name: "Dutch", location: [4.9041, 52.3676], country: "Netherlands" },
  { name: "Polish", location: [21.0122, 52.2297], country: "Poland" },
  { name: "Swedish", location: [18.0686, 59.3293], country: "Sweden" },
  { name: "Norwegian", location: [10.7522, 59.9139], country: "Norway" }
];

const LanguageGlobe = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        projection: 'globe',
        zoom: 1.5,
        center: [30, 15],
        pitch: 45,
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      map.current.scrollZoom.disable();

      // Add atmosphere and fog effects
      map.current.on('style.load', () => {
        map.current?.setFog({
          color: 'rgb(255, 255, 255)',
          'high-color': 'rgb(200, 200, 225)',
          'horizon-blend': 0.2,
        });

        // Add markers for each language
        languages.forEach((lang) => {
          const el = document.createElement('div');
          el.className = 'language-marker';
          el.style.width = '15px';
          el.style.height = '15px';
          el.style.borderRadius = '50%';
          el.style.background = 'linear-gradient(45deg, #38b6ff, #7843e6)';
          el.style.border = '2px solid white';
          el.style.cursor = 'pointer';
          el.style.boxShadow = '0 0 10px rgba(56, 182, 255, 0.5)';

          const popup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<strong>${lang.name}</strong><br>${lang.country}`);

          new mapboxgl.Marker(el)
            .setLngLat(lang.location)
            .setPopup(popup)
            .addTo(map.current!);
        });
      });

      // Rotation animation
      const secondsPerRevolution = 240;
      const maxSpinZoom = 5;
      const slowSpinZoom = 3;
      let userInteracting = false;
      let spinEnabled = true;

      function spinGlobe() {
        if (!map.current) return;
        
        const zoom = map.current.getZoom();
        if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
          let distancePerSecond = 360 / secondsPerRevolution;
          if (zoom > slowSpinZoom) {
            const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
            distancePerSecond *= zoomDif;
          }
          const center = map.current.getCenter();
          center.lng -= distancePerSecond;
          map.current.easeTo({ center, duration: 1000, easing: (n) => n });
        }
      }

      map.current.on('mousedown', () => {
        userInteracting = true;
      });
      
      map.current.on('dragstart', () => {
        userInteracting = true;
      });
      
      map.current.on('mouseup', () => {
        userInteracting = false;
        spinGlobe();
      });
      
      map.current.on('touchend', () => {
        userInteracting = false;
        spinGlobe();
      });

      map.current.on('moveend', () => {
        spinGlobe();
      });

      spinGlobe();

      setShowTokenInput(false);
      toast({
        title: "Globe initialized!",
        description: "Explore our supported languages across the world.",
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      toast({
        variant: "destructive",
        title: "Error initializing globe",
        description: "Please check your Mapbox token and try again.",
      });
    }

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapboxToken) {
      try {
        mapboxgl.accessToken = mapboxToken;
        localStorage.setItem('mapbox_token', mapboxToken);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Invalid token",
          description: "Please check your Mapbox token and try again.",
        });
      }
    }
  };

  return (
    <div className="relative w-full h-[600px] my-12">
      {showTokenInput ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10 rounded-lg">
          <form onSubmit={handleTokenSubmit} className="space-y-4 p-6 bg-background/90 rounded-lg border shadow-lg">
            <h3 className="text-lg font-semibold">Enter your Mapbox token</h3>
            <p className="text-sm text-muted-foreground">
              Get your token from <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a>
            </p>
            <input
              type="text"
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              placeholder="pk.eyJ1..."
              className="w-full p-2 border rounded"
            />
            <Button type="submit">Initialize Globe</Button>
          </form>
        </div>
      ) : null}
      <div ref={mapContainer} className="absolute inset-0 rounded-lg shadow-lg" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-background/10 rounded-lg" />
    </div>
  );
};

export default LanguageGlobe;