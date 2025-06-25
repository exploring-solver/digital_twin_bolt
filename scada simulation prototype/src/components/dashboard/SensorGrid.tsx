import React from 'react';
import { SensorCard } from './SensorCard';
import { 
  Thermometer, 
  Wind, 
  Droplets, 
  Activity, 
  Zap, 
  Gauge, 
  Shield, 
  Wrench,
  Settings,
  Move,
  AlertTriangle
} from 'lucide-react';

interface SensorGridProps {
  sensorData: any;
}

export const SensorGrid: React.FC<SensorGridProps> = ({ sensorData }) => {
  const sensorCategories = [
    {
      title: 'Control Systems',
      icon: Settings,
      color: 'blue',
      sensors: [
        {
          name: 'Button State',
          value: sensorData?.control?.buttonState || 'IDLE',
          unit: '',
          icon: Settings,
          threshold: {}
        },
        {
          name: 'Mode',
          value: sensorData?.control?.selectorSwitch || 'MANUAL',
          unit: '',
          icon: Settings,
          threshold: {}
        },
        {
          name: 'Signal Strength',
          value: sensorData?.control?.signalStrength || 0,
          unit: '%',
          icon: Activity,
          threshold: { min: 70 }
        },
        {
          name: 'Latency',
          value: sensorData?.control?.latency || 0,
          unit: 'ms',
          icon: Activity,
          threshold: { max: 50 }
        }
      ]
    },
    {
      title: 'Environmental',
      icon: Thermometer,
      color: 'green',
      sensors: [
        {
          name: 'Temperature',
          value: sensorData?.environmental?.temperature || 0,
          unit: '°C',
          icon: Thermometer,
          threshold: { min: -10, max: 50 }
        },
        {
          name: 'Humidity',
          value: sensorData?.environmental?.humidity || 0,
          unit: '%',
          icon: Droplets,
          threshold: { min: 20, max: 80 }
        },
        {
          name: 'Wind Speed',
          value: sensorData?.environmental?.windSpeed || 0,
          unit: 'm/s',
          icon: Wind,
          threshold: { max: 15 }
        },
        {
          name: 'Wind Direction',
          value: sensorData?.environmental?.windDirection || 0,
          unit: '°',
          icon: Wind,
          threshold: {}
        }
      ]
    },
    {
      title: 'Lifting Operations',
      icon: Gauge,
      color: 'yellow',
      sensors: [
        {
          name: 'Winch Load',
          value: sensorData?.lifting?.winchLoad || 0,
          unit: 'kg',
          icon: Gauge,
          threshold: { max: 2500 }
        },
        {
          name: 'Rope Tension',
          value: sensorData?.lifting?.tension || 0,
          unit: 'kN',
          icon: Activity,
          threshold: { max: 300 }
        },
        {
          name: 'Hook Height',
          value: sensorData?.lifting?.hookHeight || 0,
          unit: 'm',
          icon: Activity,
          threshold: { max: 30 }
        },
        {
          name: 'Rope Wear',
          value: sensorData?.lifting?.ropeWear || 0,
          unit: '',
          icon: AlertTriangle,
          threshold: { max: 0.8 }
        }
      ]
    },
    {
      title: 'Motor Systems',
      icon: Wrench,
      color: 'purple',
      sensors: [
        {
          name: 'Motor Current',
          value: sensorData?.motor?.motorCurrent || 0,
          unit: 'A',
          icon: Zap,
          threshold: { max: 80 }
        },
        {
          name: 'Motor Temp',
          value: sensorData?.motor?.motorTemp || 0,
          unit: '°C',
          icon: Thermometer,
          threshold: { max: 85 }
        },
        {
          name: 'RPM',
          value: sensorData?.motor?.rpm || 0,
          unit: 'rpm',
          icon: Activity,
          threshold: { min: 1400, max: 1600 }
        },
        {
          name: 'Brake Temp',
          value: sensorData?.motor?.brakeTemp || 0,
          unit: '°C',
          icon: Thermometer,
          threshold: { max: 120 }
        }
      ]
    },
    {
      title: 'Movement Control',
      icon: Move,
      color: 'blue',
      sensors: [
        {
          name: 'Slew Angle',
          value: sensorData?.movement?.slewAngle || 0,
          unit: '°',
          icon: Move,
          threshold: {}
        },
        {
          name: 'Trolley Position',
          value: sensorData?.movement?.trolleyPosition || 0,
          unit: 'm',
          icon: Move,
          threshold: { max: 35 }
        },
        {
          name: 'Hoist Speed',
          value: sensorData?.movement?.hoistSpeed || 0,
          unit: 'm/s',
          icon: Activity,
          threshold: { max: 3 }
        },
        {
          name: 'Brake Wear',
          value: sensorData?.movement?.brakeWear || 0,
          unit: '',
          icon: AlertTriangle,
          threshold: { max: 0.8 }
        }
      ]
    },
    {
      title: 'Power Management',
      icon: Zap,
      color: 'yellow',
      sensors: [
        {
          name: 'Voltage',
          value: sensorData?.power?.voltage || 0,
          unit: 'V',
          icon: Zap,
          threshold: { min: 380, max: 420 }
        },
        {
          name: 'Current',
          value: sensorData?.power?.current || 0,
          unit: 'A',
          icon: Activity,
          threshold: { max: 100 }
        },
        {
          name: 'Battery Level',
          value: sensorData?.power?.batteryLevel || 0,
          unit: '%',
          icon: Gauge,
          threshold: { min: 20 }
        },
        {
          name: 'UPS Temp',
          value: sensorData?.power?.upsTemp || 0,
          unit: '°C',
          icon: Thermometer,
          threshold: { max: 40 }
        }
      ]
    },
    {
      title: 'Safety Systems',
      icon: Shield,
      color: 'red',
      sensors: [
        {
          name: 'Overload Status',
          value: sensorData?.safety?.overload ? 'ACTIVE' : 'NORMAL',
          unit: '',
          icon: AlertTriangle,
          threshold: {}
        },
        {
          name: 'Torque',
          value: sensorData?.safety?.torque || 0,
          unit: 'Nm',
          icon: Gauge,
          threshold: { max: 3000 }
        },
        {
          name: 'E-Stop Status',
          value: sensorData?.safety?.eStop ? 'ACTIVE' : 'NORMAL',
          unit: '',
          icon: AlertTriangle,
          threshold: {}
        },
        {
          name: 'Operator Present',
          value: sensorData?.safety?.operatorPresent ? 'YES' : 'NO',
          unit: '',
          icon: Shield,
          threshold: {}
        }
      ]
    },
    {
      title: 'Structural Health',
      icon: Activity,
      color: 'green',
      sensors: [
        {
          name: 'Boom Strain',
          value: sensorData?.structural?.boomStrain || 0,
          unit: 'με',
          icon: Activity,
          threshold: { max: 700 }
        },
        {
          name: 'Tilt Angle',
          value: sensorData?.structural?.tiltAngle || 0,
          unit: '°',
          icon: Activity,
          threshold: { max: 5 }
        },
        {
          name: 'Ground Pressure',
          value: sensorData?.structural?.groundPressure || 0,
          unit: 'MPa',
          icon: Gauge,
          threshold: { max: 3 }
        },
        {
          name: 'Base Vibration',
          value: sensorData?.structural?.baseVibration || 0,
          unit: 'm/s²',
          icon: Activity,
          threshold: { max: 0.5 }
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {sensorCategories.map((category, categoryIndex) => (
        <SensorCard
          key={category.title}
          category={category}
          delay={categoryIndex * 0.1}
        />
      ))}
    </div>
  );
};