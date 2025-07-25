import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Volume2, VolumeX, Crown, Play, Pause } from 'lucide-react';

export default function AmbientSounds() {
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([0.5]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const sounds = [
    {
      id: 'rain',
      name: 'Rain',
      icon: '🌧️',
      free: true,
      // Using a free rain sound URL
      url: 'https://www.soundjay.com/misc/sounds/rain-01.wav',
      // Fallback to a web audio API generated rain sound
      generateAudio: () => generateRainSound(),
    },
    {
      id: 'ocean',
      name: 'Ocean',
      icon: '🌊',
      free: true,
      generateAudio: () => generateOceanSound(),
    },
    {
      id: 'forest',
      name: 'Forest',
      icon: '🌲',
      free: true,
      generateAudio: () => generateForestSound(),
    },
    {
      id: 'cafe',
      name: 'Cafe',
      icon: '☕',
      premium: true,
    },
    {
      id: 'fireplace',
      name: 'Fireplace',
      icon: '🔥',
      premium: true,
    },
    {
      id: 'birds',
      name: 'Birds',
      icon: '🐦',
      premium: true,
    },
  ];

  // Audio generation functions
  const generateRainSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const bufferSize = audioContext.sampleRate * 2; // 2 seconds of audio
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate white noise for rain effect
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }
    
    return { audioContext, buffer };
  };

  const generateOceanSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const bufferSize = audioContext.sampleRate * 4; // 4 seconds of audio
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate wave-like sound
    for (let i = 0; i < bufferSize; i++) {
      const t = i / audioContext.sampleRate;
      data[i] = Math.sin(2 * Math.PI * 0.5 * t) * 0.2 + 
                (Math.random() * 2 - 1) * 0.1;
    }
    
    return { audioContext, buffer };
  };

  const generateForestSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const bufferSize = audioContext.sampleRate * 3; // 3 seconds of audio
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate subtle wind and rustling sounds
    for (let i = 0; i < bufferSize; i++) {
      const t = i / audioContext.sampleRate;
      data[i] = Math.sin(2 * Math.PI * 0.2 * t) * 0.1 + 
                (Math.random() * 2 - 1) * 0.05;
    }
    
    return { audioContext, buffer };
  };

  const playGeneratedSound = (soundId: string) => {
    const sound = sounds.find(s => s.id === soundId);
    if (!sound?.generateAudio) return;

    try {
      const { audioContext, buffer } = sound.generateAudio();
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
      
      source.buffer = buffer;
      source.loop = true;
      gainNode.gain.value = volume[0];
      
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      source.start();
      
      // Store reference to stop later
      audioRef.current = source as any;
      
    } catch (error) {
      console.error('Error playing generated sound:', error);
    }
  };

  const stopSound = () => {
    if (audioRef.current) {
      try {
        if ('stop' in audioRef.current) {
          (audioRef.current as any).stop();
        }
        audioRef.current = null;
      } catch (error) {
        console.error('Error stopping sound:', error);
      }
    }
  };

  useEffect(() => {
    if (audioRef.current && 'context' in audioRef.current) {
      const gainNode = (audioRef.current as any).context.createGain();
      gainNode.gain.value = volume[0];
    }
  }, [volume]);

  const handleSoundSelect = (soundId: string, isPremium?: boolean) => {
    if (isPremium) {
      window.location.href = '/subscribe';
      return;
    }

    if (selectedSound === soundId && isPlaying) {
      stopSound();
      setIsPlaying(false);
      setSelectedSound(null);
    } else {
      stopSound(); // Stop any currently playing sound
      setSelectedSound(soundId);
      setIsPlaying(true);
      playGeneratedSound(soundId);
      console.log(`Playing ${soundId} sound`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Volume2 className="w-5 h-5 text-primary" />
          <span>Ambient Sounds</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {sounds.map((sound) => (
            <div key={sound.id} className="relative">
              <button
                onClick={() => handleSoundSelect(sound.id, sound.premium)}
                className={`relative group w-full h-20 rounded-xl overflow-hidden transition-all duration-200 ${
                  selectedSound === sound.id && isPlaying
                    ? 'ring-2 ring-primary shadow-lg scale-105'
                    : 'hover:scale-105 hover:shadow-md'
                }`}
              >
                <div className={`w-full h-full flex flex-col items-center justify-center ${
                  sound.premium 
                    ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' 
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  <span className="text-2xl mb-1">{sound.icon}</span>
                  {sound.premium && (
                    <Crown className="w-3 h-3 text-white" />
                  )}
                </div>
                
                <div className="absolute bottom-1 left-1 text-white text-xs font-medium bg-black/50 px-1 rounded">
                  {sound.name}
                </div>
                
                {sound.premium && (
                  <div className="absolute top-1 right-1">
                    <Crown className="w-3 h-3 text-yellow-400" />
                  </div>
                )}
                
                {selectedSound === sound.id && isPlaying && (
                  <div className="absolute top-1 left-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  </div>
                )}
              </button>
            </div>
          ))}
        </div>
        
        {/* Sound Controls */}
        {selectedSound && isPlaying && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">
                  Playing: {sounds.find(s => s.id === selectedSound)?.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  stopSound();
                  setIsPlaying(false);
                  setSelectedSound(null);
                }}
              >
                <VolumeX className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Premium CTA */}
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Want access to all premium sounds?
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.location.href = '/subscribe'}
            className="border-yellow-200 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-700 dark:text-yellow-300 dark:hover:bg-yellow-900/20"
          >
            <Crown className="w-4 h-4 mr-1" />
            Unlock Premium
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
