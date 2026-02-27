import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Box, Cylinder, Text, useGLTF, Torus } from '@react-three/drei';
import * as THREE from 'three';
import {
  ShieldAlert, ShieldCheck, Fan, DoorOpen, DoorClosed,
  Wind, AlertTriangle, Power, UserCircle, Maximize2
} from 'lucide-react';

// ==========================================
// 1. KOMPONEN 3D (SIMULASI RUANGAN FISIK)
// ==========================================
const RoomSimulation = ({ isEmergency, doorOpen, windowOpen, fanOn }) => {
  const doorHingeRef = useRef();
  const windowRef = useRef();
  const fanBladesRef = useRef();
  const lightRef = useRef();
  const alarmRef = useRef();
  const fanSpeed = useRef(0);

  // Load model GLTF dari folder public/models/
  const { scene: propellerScene } = useGLTF('/models/scene.gltf');
  
  useFrame((state, delta) => {
    // 1. Animasi Pintu
    const targetDoorRot = doorOpen ? Math.PI / 2 : 0;
    doorHingeRef.current.rotation.y = THREE.MathUtils.lerp(doorHingeRef.current.rotation.y, targetDoorRot, delta * 6);

    // 2. Animasi Jendela
    const targetWindowY = windowOpen ? 3 : 2;
    windowRef.current.position.y = THREE.MathUtils.lerp(windowRef.current.position.y, targetWindowY, delta * 5);

    // 3. Animasi Kipas Fisika
    if (fanOn) {
      fanSpeed.current = THREE.MathUtils.lerp(fanSpeed.current, 4, delta * 2);
    } else {
      fanSpeed.current = THREE.MathUtils.lerp(fanSpeed.current, 0, delta * 1.5);
    }

    if (fanBladesRef.current) {
      fanBladesRef.current.rotation.z -= fanSpeed.current * delta;
    }

    // 4. Efek Lampu Sirine & Alarm Fisik
    if (isEmergency) {
      const strobe = (Math.sin(state.clock.elapsedTime * 20) + 1) / 2;
      lightRef.current.intensity = 2 + strobe * 4;
      lightRef.current.color.setHex(0xff0000);
      alarmRef.current.scale.setScalar(1 + strobe * 0.15);
    } else {
      lightRef.current.intensity = 2;
      lightRef.current.color.setHex(0xeef7ff);
      alarmRef.current.scale.setScalar(1);
    }
  });

  return (
    <group position={[0, -2, 0]}>
      {/* ================= PENCAHAYAAN ================= */}
      <ambientLight intensity={isEmergency ? 0.4 : 1.2} />
      <directionalLight position={[5, 10, 5]} intensity={isEmergency ? 0.2 : 1.5} color="#ffffff" />
      <pointLight ref={lightRef} position={[0, 4, -2]} distance={25} decay={2} />

      {/* Lantai Hitam Elegan */}
      <Box args={[12, 0.5, 12]} position={[0, -0.25, 0]}>
        <meshStandardMaterial color="#111111" roughness={0.2} metalness={0.8} />
      </Box>

      {/* Dinding Belakang */}
      <Box args={[12, 6, 0.5]} position={[0, 3, -5]}>
        <meshStandardMaterial color="#202020" roughness={0.7} />
      </Box>

      {/* ================= LABEL & SENSOR ALARM TENGAN ================= */}
      <group position={[0, 2.5, -4.7]}>
        {/* Desain Sirine Tanpa Penutup Atas & Merah Pekat */}
        <group ref={alarmRef}>
          {/* Base / Dudukan Besi */}
          <mesh position={[0, 0, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.25, 0.3, 0.1, 32]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.4} />
          </mesh>

          {/* Kaca Sirine */}
          <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.22, 0.3, 32]} />
            <meshStandardMaterial 
              color={isEmergency ? "#ff0000" : "#550000"} 
              emissive={isEmergency ? "#ff0000" : "#000000"} 
              emissiveIntensity={isEmergency ? 2 : 0}
              transparent={true}
              opacity={0.6}
              roughness={0.1}
              metalness={0.5}
              toneMapped={false} // Mencegah warna merah berubah jadi oranye/kuning saat terang
            />
          </mesh>

          {/* Inti Lampu (Diubah ke Merah Murni) */}
          <mesh position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.15, 16]} />
            <meshStandardMaterial 
              color={isEmergency ? "#ff0000" : "#222222"} 
              emissive={isEmergency ? "#ff0000" : "#000000"} 
              emissiveIntensity={isEmergency ? 5 : 0}
              toneMapped={false} // Mempertahankan warna merah sejati walau intensitas tinggi
            />
          </mesh>

          {/* Cincin Pelindung Bawah */}
          <mesh position={[0, 0, -0.05]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.26, 0.26, 0.03, 32]} />
            <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>

        <Text position={[0, 0.6, 0.1]} fontSize={0.25} color="#00ffcc" font="https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxM.woff" anchorX="center" outlineWidth={0.02} outlineColor="#000">
          MQ-2 SENSOR & BUZZER
        </Text>
      </group>

      {/* ================= PINTU UTAMA ================= */}
      <group position={[-5, 0, -4.7]}>
        <Text position={[1.25, 4.8, 0.1]} fontSize={0.25} color="#ffffff" font="https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxM.woff" anchorX="center" outlineWidth={0.02} outlineColor="#000">
          PINTU AKSES (SERVO 1)
        </Text>
        <group ref={doorHingeRef}>
          <Box args={[2.5, 4.5, 0.15]} position={[1.25, 2.25, 0]}>
            <meshStandardMaterial color={isEmergency ? "#4a1111" : "#718096"} metalness={0.4} roughness={0.5} />
          </Box>
          <Box args={[0.05, 0.5, 0.3]} position={[2.3, 2.25, 0]}>
            <meshStandardMaterial color="#ffffff" metalness={0.8} />
          </Box>
        </group>
      </group>

      {/* ================= JENDELA VENTILASI ================= */}
      <group position={[3.6, 0, -4.7]}>
        <Text position={[0, 4.8, 0.1]} fontSize={0.25} color="#ffffff" anchorX="center" outlineWidth={0.02} outlineColor="#000">
          VENTILASI DARURAT (SERVO 2)
        </Text>
        <Box args={[2.6, 0.2, 0.3]} position={[0, 0.9, 0]}><meshStandardMaterial color="#1a202c" /></Box>
        <Box args={[2.6, 0.2, 0.3]} position={[0, 3.1, 0]}><meshStandardMaterial color="#1a202c" /></Box>
        <Box args={[0.2, 2.4, 0.3]} position={[-1.2, 2, 0]}><meshStandardMaterial color="#1a202c" /></Box>
        <Box args={[0.2, 2.4, 0.3]} position={[1.2, 2, 0]}><meshStandardMaterial color="#1a202c" /></Box>

        <Box ref={windowRef} args={[2.2, 2, 0.05]} position={[0, 1.2, 0]}>
          <meshStandardMaterial color="#90cdf4" transparent opacity={0.4} roughness={0.1} metalness={0.9} />
        </Box>
      </group>

      {/* ================= KIPAS EXHAUST (GLTF MODEL) ================= */}
      <group position={[0, 4.5, -4.6]}>
        <Text position={[0, 1.2, 0.1]} fontSize={0.25} color="#ffffff" anchorX="center" outlineWidth={0.02} outlineColor="#000">
          EXHAUST FAN (5V RELAY)
        </Text>

        <Torus args={[0.8, 0.08, 16, 64]} position={[0, 0, -0.05]}>
          <meshStandardMaterial color="#fff" metalness={0.6} roughness={0.4} />
        </Torus>

        <group ref={fanBladesRef}>
          <primitive
            object={propellerScene}
            scale={0.03}
            rotation={[0.75, 0, 0]}
            position={[0, -0.3, 0]}
          />
        </group>
      </group>
    </group>
  );
};

// ==========================================
// 2. MAIN DASHBOARD COMPONENT
// ==========================================
export default function App() {
  const [gasLevel, setGasLevel] = useState(5);
  const [isEmergency, setIsEmergency] = useState(false);
  const [doorOpen, setDoorOpen] = useState(true);
  const [windowOpen, setWindowOpen] = useState(false);
  const [fanOn, setFanOn] = useState(false);

  const roles = ['admin', 'head of office', 'secretary', 'head of division', 'staff'];
  const [currentRole, setCurrentRole] = useState('admin');

  const audioCtxRef = useRef(null);
  const intervalRef = useRef(null);

  const playBuzzer = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();

    intervalRef.current = setInterval(() => {
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900, audioCtxRef.current.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.start();
      osc.stop(audioCtxRef.current.currentTime + 0.3);
    }, 400);
  };

  const stopBuzzer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    const sensorSim = setInterval(() => {
      if (!isEmergency && gasLevel < 15) {
        setGasLevel(Math.floor(Math.random() * 5) + 5);
      }
    }, 2000);

    if (gasLevel > 70 && !isEmergency) {
      setIsEmergency(true);
      setDoorOpen(false);
      setWindowOpen(true);
      setFanOn(true);
      playBuzzer();
    }
    return () => clearInterval(sensorSim);
  }, [gasLevel, isEmergency]);

  const triggerGasLeak = () => {
    if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
    setGasLevel(85);
  };

  const systemOverride = () => {
    setIsEmergency(false);
    setDoorOpen(true);
    setWindowOpen(false);
    setFanOn(false);
    setGasLevel(5);
    stopBuzzer();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#202020] font-sans text-zinc-100 select-none">

      {/* 3D CANVAS BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 2, 8], fov: 55 }}>
          <Environment preset="city" />
          <RoomSimulation isEmergency={isEmergency} doorOpen={doorOpen} windowOpen={windowOpen} fanOn={fanOn} />
          <OrbitControls
            enableZoom={true}
            maxDistance={12}
            minDistance={4}
            maxPolarAngle={Math.PI / 1.8}
            minPolarAngle={Math.PI / 3}
            minAzimuthAngle={-Math.PI / 3}
            maxAzimuthAngle={Math.PI / 3}
          />
        </Canvas>
      </div>

      {/* OVERLAY UI (GLASSMORPHISM) */}
      <div className="absolute inset-0 z-10 p-4 md:p-6 flex flex-col pointer-events-none">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 rounded-2xl pointer-events-auto w-full">
          <div className="flex items-center gap-3 md:gap-4">
            <ShieldCheck className={`w-8 h-8 md:w-9 md:h-9 ${isEmergency ? 'text-red-500' : 'text-cyan-400'}`} />
            <div>
              <h1 className="text-lg md:text-xl font-semibold tracking-widest text-zinc-100 drop-shadow-md">
                SMART OFFICE <span className={isEmergency ? 'text-red-500' : 'text-cyan-400'}>HAZMAT</span>
              </h1>
              <p className="text-[10px] md:text-xs text-zinc-300 font-mono mt-0.5">NODE: ESP32-ALPHA-01 | PROTOCOL: WEBSOCKET</p>
            </div>
          </div>
          <div className="flex items-center justify-between md:justify-start gap-3 bg-zinc-800/80 p-2 md:p-2.5 rounded-lg border border-zinc-600 hover:border-zinc-400 transition-colors w-full md:w-auto">
            <div className="flex items-center gap-3">
              <UserCircle className="w-5 h-5 text-zinc-300" />
              <select
                className="bg-transparent text-sm font-semibold text-zinc-100 outline-none cursor-pointer uppercase drop-shadow-md w-full"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
              >
                {roles.map(r => <option key={r} value={r} className="bg-zinc-800">{r}</option>)}
              </select>
            </div>
          </div>
        </header>

        {/* MAIN PANELS */}
        <main className="flex-1 flex flex-col md:flex-row items-center md:items-end justify-end md:justify-between pb-0 md:pb-4 gap-4 md:gap-6 pointer-events-none relative mt-4 md:mt-0">

          {/* PANEL KIRI: LIVE TELEMETRY */}
          <div className="w-full max-w-sm md:max-w-none md:w-80 bg-zinc-950/80 backdrop-blur-xl border border-zinc-700 p-5 md:p-6 rounded-2xl shadow-2xl pointer-events-auto shrink-0 z-10">
            <h2 className="text-xs font-semibold text-zinc-400 mb-4 md:mb-5 tracking-widest border-b border-zinc-700 pb-3">LIVE SENSOR TELEMETRY</h2>

            <div className="mb-5 md:mb-6 bg-black/60 p-4 rounded-xl border border-zinc-700/50">
              <div className="flex justify-between mb-3 items-center">
                <span className="flex items-center gap-2 text-sm font-semibold text-zinc-200"><Wind className="w-4 h-4 text-cyan-400" /> GAS LEVEL (MQ-2)</span>
                <span className={`font-mono font-semibold text-xl ${isEmergency ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>{gasLevel}%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-500 ${isEmergency ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-cyan-500 shadow-[0_0_10px_cyan]'}`} style={{ width: `${gasLevel}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5 md:mb-6">
              <div className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 border transition-colors duration-500 ${doorOpen ? 'bg-emerald-900/60 border-emerald-500/50 text-emerald-300' : 'bg-red-900/60 border-red-500/50 text-red-300'}`}>
                {doorOpen ? <DoorOpen className="w-7 h-7" /> : <DoorClosed className="w-7 h-7" />}
                <span className="text-[10px] tracking-wider font-semibold text-center">{doorOpen ? 'PINTU TERBUKA' : 'PINTU TERKUNCI'}</span>
              </div>
              <div className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 border transition-colors duration-500 ${windowOpen ? 'bg-amber-900/60 border-amber-500/50 text-amber-300' : 'bg-zinc-800/80 border-zinc-600 text-zinc-400'}`}>
                <Maximize2 className={`w-7 h-7 transition-transform ${windowOpen ? 'scale-110' : ''}`} />
                <span className="text-[10px] tracking-wider font-semibold text-center">{windowOpen ? 'VENTILASI BUKA' : 'VENTILASI TUTUP'}</span>
              </div>
              <div className={`col-span-2 p-4 rounded-xl flex items-center justify-center gap-4 border transition-colors duration-500 ${fanOn ? 'bg-cyan-900/60 border-cyan-500/50 text-cyan-300' : 'bg-zinc-800/80 border-zinc-600 text-zinc-400'}`}>
                <Fan className={`w-8 h-8 ${fanOn ? 'animate-spin' : ''}`} style={{ animationDuration: '0.5s' }} />
                <div className="flex flex-col">
                  <span className="text-[11px] tracking-widest font-semibold">EXHAUST FAN</span>
                  <span className="text-[11px] md:text-xs font-mono">{fanOn ? 'ACTIVE (12V RELAY)' : 'STANDBY'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={triggerGasLeak}
              className={`w-full py-3.5 md:py-4 rounded-xl text-sm md:text-base font-semibold tracking-widest flex items-center justify-center gap-3 transition-all ${isEmergency ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700' : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.6)] active:scale-95'}`}
            >
              <AlertTriangle className="w-4 h-4 md:w-5 md:h-5" /> {isEmergency ? 'HAZARD ACTIVE' : 'TEST TRIGGER LEAK'}
            </button>
          </div>

          {/* PANEL KANAN: EMERGENCY OVERRIDE */}
          <div className={`w-full max-w-sm md:max-w-none md:w-96 p-6 md:p-8 rounded-3xl backdrop-blur-2xl border transition-all duration-700 absolute md:relative bottom-4 md:bottom-auto self-center md:self-auto z-50 pointer-events-auto ${isEmergency ? 'bg-red-950/90 border-red-500/70 shadow-[0_0_80px_rgba(220,38,38,0.6)] translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
            <div className="flex flex-col items-center text-center">
              <ShieldAlert className="w-20 h-20 md:w-24 md:h-24 text-red-500 mb-5 md:mb-6 animate-pulse drop-shadow-lg" />
              <h2 className="text-3xl md:text-4xl font-semibold tracking-widest text-red-500 mb-2 drop-shadow-md">LOCKDOWN</h2>
              <p className="text-red-200 text-xs md:text-sm mb-6 md:mb-8 font-semibold tracking-wide">PROTOKOL EVAKUASI DIAKTIFKAN. RUANGAN DIISOLASI.</p>

              {(currentRole === 'admin' || currentRole === 'head of office') ? (
                <div className="w-full">
                  <p className="text-[10px] md:text-xs text-red-300 mb-3 font-mono bg-red-900/80 py-1.5 rounded font-semibold">AUTH: {currentRole.toUpperCase()} DETECTED</p>
                  <button
                    onClick={systemOverride}
                    className="w-full bg-red-600 hover:bg-red-500 text-white text-sm md:text-base font-semibold tracking-widest py-4 md:py-5 rounded-xl shadow-[0_0_30px_rgba(220,38,38,0.8)] flex items-center justify-center gap-3 transition-transform active:scale-95 border border-red-400"
                  >
                    <Power className="w-5 h-5 md:w-6 md:h-6" /> SYSTEM OVERRIDE
                  </button>
                </div>
              ) : (
                <div className="w-full bg-black/80 p-4 md:p-5 rounded-xl border border-red-700/80">
                  <p className="text-lg md:text-xl font-semibold text-zinc-300 mb-1 tracking-widest">AKSES DITOLAK</p>
                  <p className="text-[10px] md:text-xs text-zinc-400 font-mono mt-2 leading-relaxed">Otorisasi <span className="text-red-400 font-semibold">'{currentRole}'</span> tidak mencukupi untuk intervensi sistem keamanan.</p>
                </div>
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}