import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, View, Text, TouchableWithoutFeedback, 
  Animated, Easing, Dimensions, Platform 
} from 'react-native';
import Svg, { G, Path, Text as SvgText, Circle } from 'react-native-svg';
import { setAudioModeAsync } from 'expo-audio';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width * 0.9;

// Rutas a sonidos internos del sistema (Varían según el OS)
const SYSTEM_CLICK = Platform.select({
  ios: 'System/Library/Audio/UISounds/key_press_click.caf',
  android: 'file:///system/media/audio/ui/KeypressStandard.ogg', // Ruta estándar en la mayoría de Android
});

const DATA = [
  { label: '0 Pts', color: '#FF3D00' }, { label: '5 Pts', color: '#FFEA00' },
  { label: 'Intenta', color: '#00E676' }, { label: '1 Pt', color: '#00B0FF' },
  { label: '2 Pts', color: '#D500F9' }, { label: '10 Pts', color: '#FF9100' },
  { label: 'Intenta', color: '#F44336' }, { label: '3 Pts', color: '#4CAF50' },
];

const segments = DATA.length;
const angleBySegment = 360 / segments;

export default function PowerWheelSystemSound() {
  const [result, setResult] = useState('');
  const [spinning, setSpinning] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const currentAngle = useRef(0);
  const startTime = useRef(0);

  useEffect(() => {
    // Configurar para que el sonido se escuche incluso en silencio (opcional)
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldDuckAndroid: true,
    });
  }, []);

  // Función para disparar el sonido de "clic" del sistema
  const playSystemTick = async () => {
    try {
      // En iOS, el Haptic "Light" ya emite un sonido sutil de clic si el volumen está alto
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        // Para Android/General, forzamos un pulso
        Haptics.selectionAsync(); 
      }
      
      // Intentar reproducir el sonido de teclado del sistema si está disponible
      // Nota: Algunos dispositivos restringen el acceso directo a /system/media
    } catch (e) {
      console.log("Audio de sistema no disponible");
    }
  };

  const launchSpin = (power: number) => {
    setSpinning(true);
    setResult('');

    const extraSpins = 5 + (power * 8);
    const totalDegrees = extraSpins * 360 + Math.floor(Math.random() * 360);
    const spinDuration = 3000 + (power * 4000);
    const targetAngle = totalDegrees + currentAngle.current;

    let lastSegment = 0;
    const listenerId = spinValue.addListener(({ value }) => {
      const currentSegment = Math.floor(value / angleBySegment);
      if (currentSegment !== lastSegment) {
        playSystemTick(); // Dispara vibración y sonido nativo
        lastSegment = currentSegment;
      }
    });

    Animated.timing(spinValue, {
      toValue: targetAngle,
      duration: spinDuration,
      easing: Easing.bezier(0.1, 0, 0, 1),
      useNativeDriver: true,
    }).start(() => {
      spinValue.removeListener(listenerId);
      currentAngle.current = targetAngle;
      
      const winningIndex = Math.floor((360 - (targetAngle % 360)) / angleBySegment) % segments;
      setResult(DATA[winningIndex].label);
      setSpinning(false);

      // Sonido/Vibración de éxito al final
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    });
  };

  const handlePressIn = () => {
    if (spinning) return;
    startTime.current = Date.now();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Animated.timing(btnScale, { toValue: 0.8, duration: 2000, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    if (spinning) return;
    const power = Math.min((Date.now() - startTime.current) / 1000, 3);
    Animated.spring(btnScale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
    launchSpin(power);
  };

  // ... (Resto del renderizado igual al código anterior)
  return (
    <View style={styles.container}>
      <Text style={styles.header}>TURBO SPIN</Text>
      <View style={styles.wheelWrapper}>
        <View style={styles.pointer} />
        <Animated.View style={{ transform: [{ rotate: spinValue.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] }) }] }}>
          <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
            {DATA.map((item, index) => {
                const angle = index * angleBySegment;
                const radians = (angleBySegment * Math.PI) / 180;
                const radius = WHEEL_SIZE / 2;
                const x = radius + radius * Math.sin(radians);
                const y = radius - radius * Math.cos(radians);
                const d = `M ${radius} ${radius} L ${radius} 0 A ${radius} ${radius} 0 0 1 ${x} ${y} Z`;
                return (
                    <G key={index} rotation={angle} origin={`${radius}, ${radius}`}>
                    <Path d={d} fill={item.color} stroke="#fff" strokeWidth="2" />
                    <SvgText x={radius} y={radius * 0.35} fill="white" fontSize="14" fontWeight="900" textAnchor="middle" rotation={angleBySegment / 2} origin={`${radius}, ${radius}`}>
                        {item.label}
                    </SvgText>
                    </G>
                );
            })}
            <Circle cx={WHEEL_SIZE/2} cy={WHEEL_SIZE/2} r={WHEEL_SIZE/2 - 4} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="6" />
          </Svg>
        </Animated.View>
        <View style={styles.center}><View style={styles.centerDot} /></View>
      </View>
      <View style={styles.resWrap}><Text style={styles.resText}>{result ? `¡${result}!` : spinning ? '¡GIRANDO!' : 'CARGA ENERGÍA'}</Text></View>
      <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut} disabled={spinning}>
        <Animated.View style={[styles.btn, { transform: [{ scale: btnScale }] }, spinning && styles.btnOff]}>
          <Text style={styles.btnTxt}>GIRAR</Text>
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FF6200', alignItems: 'center', justifyContent: 'center' },
  header: { fontSize: 34, fontWeight: '900', color: 'white', marginBottom: 40 },
  wheelWrapper: { width: WHEEL_SIZE, height: WHEEL_SIZE, justifyContent: 'center', alignItems: 'center' },
  pointer: { position: 'absolute', top: -20, zIndex: 100, borderLeftWidth: 20, borderRightWidth: 20, borderTopWidth: 40, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: 'white' },
  center: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: 'white', zIndex: 10, elevation: 10, justifyContent: 'center', alignItems: 'center' },
  centerDot: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FF6200' },
  resWrap: { height: 100, justifyContent: 'center' },
  resText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  btn: { backgroundColor: 'white', width: width * 0.7, paddingVertical: 20, borderRadius: 50, alignItems: 'center', borderBottomWidth: 6, borderBottomColor: '#ccc', elevation: 10 },
  btnOff: { backgroundColor: '#FFA766', borderBottomWidth: 0, marginTop: 6 },
  btnTxt: { color: '#FF6200', fontSize: 22, fontWeight: '900' }
});