import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { GoogleMap, useLoadScript } from "@react-google-maps/api";

const center = { lat: 27.579, lng: 77.699 }; 

export default function ItineraryPage() {
  const [pandits, setPandits] = useState([]);
  const [temples, setTemples] = useState([]);
  const [lunchSpots, setLunchSpots] = useState([]);

  const [selectedPandit, setSelectedPandit] = useState("");
  const [selectedTemples, setSelectedTemples] = useState([]);
  const [selectedLunch, setSelectedLunch] = useState("");

  
  const [templeDurations, setTempleDurations] = useState({});

  const [mapPandit, setMapPandit] = useState(null);
  const [mapTemples, setMapTemples] = useState([]);
  const [mapLunch, setMapLunch] = useState(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API,
    libraries: ["marker"],
  });

  const [aiSummary, setAiSummary] = useState("");
  const [timeline, setTimeline] = useState([]);
  const [mapRef, setMapRef] = useState(null);
  const markerRefs = useRef([]);

  useEffect(() => {
    axios.get("http://localhost:8080/api/pandits/").then((res) => setPandits(res.data));
    axios.get("http://localhost:8080/api/temples/").then((res) => setTemples(res.data));
    axios.get("http://localhost:8080/api/lunchspots/").then((res) => setLunchSpots(res.data));
  }, []);

  const handleTempleSelect = (id) => {
    if (selectedTemples.includes(id)) {
      setSelectedTemples(selectedTemples.filter((t) => t !== id));
      const newDurations = { ...templeDurations };
      delete newDurations[id];
      setTempleDurations(newDurations);
      return;
    }
    if (selectedTemples.length >= 3) {
      alert("You can select only 3 temples.");
      return;
    }
    setSelectedTemples([...selectedTemples, id]);
  };

  const handleTempleDurationChange = (id, value) => {
    setTempleDurations({ ...templeDurations, [id]: value });
  };

  const generateTimeline = (panditObj, templeObjs, lunchObj) => {
    const start = new Date();
    start.setHours(9, 0, 0, 0); 
    let current = new Date(start);
    let entries = [];

    const addSlot = (label, minutes) => {
      let end = new Date(current.getTime() + minutes * 60000);
      entries.push({
        start: current.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        end: end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        label,
      });
      current = end;
    };

    
    addSlot(`Pandit Ritual with ${panditObj.name}`, 30);
    addSlot("Travel", 15);

    
    templeObjs.forEach((t, i) => {
      const duration = parseInt(templeDurations[t.id]) || 45; 
      addSlot(`Visit ${t.name}`, duration);
      if (i < templeObjs.length - 1) addSlot("Travel", 15);
    });

    addSlot("Travel", 15);
    addSlot(`Lunch at ${lunchObj.name}`, 60);

    return entries;
  };

  const handleGenerate = async () => {
    const panditObj = pandits.find((p) => p.id == selectedPandit);
    const templeObjs = temples.filter((t) => selectedTemples.includes(t.id));
    const lunchObj = lunchSpots.find((l) => l.id == selectedLunch);

    setMapPandit(panditObj);
    setMapTemples(templeObjs);
    setMapLunch(lunchObj);

    if (!panditObj || templeObjs.length === 0 || !lunchObj) {
      console.log("Missing fields.");
      return;
    }

    const tl = generateTimeline(panditObj, templeObjs, lunchObj);
    setTimeline(tl);

    try {
      const res = await axios.post("http://localhost:8080/api/ai/summary", {
        pandit: panditObj.name,
        temples: templeObjs.map((t) => t.name),
        lunchSpot: lunchObj.name,
      });
      setAiSummary(res.data.summary);
    } catch (err) {
      console.log("AI Summary Error:", err);
    }
  };

  
  useEffect(() => {
    if (!mapRef) return;
    if (!mapPandit || mapTemples.length === 0 || !mapLunch) return;

    const { AdvancedMarkerElement } = window.google.maps.marker;

    markerRefs.current.forEach((m) => (m.map = null));
    markerRefs.current = [];

    const sequence = [];

    sequence.push({ lat: mapPandit.latitude, lng: mapPandit.longitude, name: mapPandit.name });
    mapTemples.forEach((t) => sequence.push({ lat: t.latitude, lng: t.longitude, name: t.name }));
    sequence.push({ lat: mapLunch.latitude, lng: mapLunch.longitude, name: mapLunch.name });

    sequence.forEach((loc) => {
      const m = new AdvancedMarkerElement({
        map: mapRef,
        position: { lat: loc.lat, lng: loc.lng },
        title: loc.name,
      });
      markerRefs.current.push(m);
    });
  }, [mapRef, mapPandit, mapTemples, mapLunch, timeline]);

  if (!isLoaded) return <p>Loading map…</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <h1 className="text-3xl font-bold text-center mb-10">
        Pilgrimage City Itinerary Generator
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <div className="bg-white p-6 rounded-2xl shadow-md space-y-6">
          
          <div>
            <label className="block font-semibold mb-2">Pandit</label>
            <select
              className="w-full p-3 border rounded-lg"
              value={selectedPandit}
              onChange={(e) => setSelectedPandit(e.target.value)}
            >
              <option value="">Select Pandit</option>
              {pandits.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          
          <div>
            <label className="block font-semibold mb-2">Temples</label>
            <div className="border rounded-lg p-3 max-h-60 overflow-y-auto">
              {temples.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-1">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedTemples.includes(t.id)}
                      onChange={() => handleTempleSelect(t.id)}
                    />
                    <span>{t.name}</span>
                  </label>
                  {selectedTemples.includes(t.id) && (
                    <input
                      type="number"
                      min="5"
                      placeholder="Minutes"
                      value={templeDurations[t.id] || ""}
                      onChange={(e) => handleTempleDurationChange(t.id, e.target.value)}
                      className="w-20 p-1 border rounded"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          
          <div>
            <label className="block font-semibold mb-2">Lunch Spot</label>
            <select
              className="w-full p-3 border rounded-lg"
              value={selectedLunch}
              onChange={(e) => setSelectedLunch(e.target.value)}
            >
              <option value="">Select Lunch Spot</option>
              {lunchSpots.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerate}
            className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold"
          >
            Generate Itinerary
          </button>
        </div>

        
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <GoogleMap
            zoom={13}
            center={center}
            mapContainerStyle={{ height: "500px", width: "100%" }}
            onLoad={(map) => setMapRef(map)}
          />
        </div>
      </div>

      
      {aiSummary && (
        <div className="max-w-4xl mx-auto mt-10 bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-bold mb-3">Itinerary</h2>
          <p className="text-gray-700 leading-relaxed">{aiSummary}</p>
        </div>
      )}

      
      {timeline.length > 0 && (
        <div className="max-w-4xl mx-auto mt-6 bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-bold mb-3">Timeline</h2>
          <ul className="space-y-2">
            {timeline.map((t, idx) => (
              <li key={idx} className="text-gray-800">
                <strong>{t.start} – {t.end}</strong> : {t.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
