import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Crown } from 'lucide-react';

export default function AmbientSounds() {
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const sounds = [
    {
      id: 'rain',
      name: 'Rain',
      image: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=120',
      icon: '🌧️',
      free: true,
    },
    {
      id: 'ocean',
      name: 'Ocean',
      image: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=120',
      icon: '🌊',
      free: true,
    },
    {
      id: 'forest',
      name: 'Forest',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=120',
      icon: '🌲',
      free: true,
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

  const handleSoundSelect = (soundId: string, isPremium?: boolean) => {
    if (isPremium) {
      // Redirect to subscription page
      window.location.href = '/subscribe';
      return;
    }

    if (selectedSound === soundId && isPlaying) {
      setIsPlaying(false);
      setSelectedSound(null);
    } else {
      setSelectedSound(soundId);
      setIsPlaying(true);
      // In a real implementation, this would play the actual sound
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
                {sound.image ? (
                  <>
                    <img
                      src={sound.image}
                      alt={sound.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl">{sound.icon}</span>
                    </div>
                  </>
                ) : (
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
                )}
                
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
