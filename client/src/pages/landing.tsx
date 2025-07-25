import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Timer, BarChart3, Zap, Crown, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-purple-200/20 dark:border-gray-700/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                FocusZen
              </h1>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-6 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              Productivity Made Simple
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
              Master Your Focus with{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                FocusZen
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              The ultimate Pomodoro timer with ambient sounds, analytics, and streak tracking. 
              Build better focus habits and boost your productivity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => window.location.href = '/api/login'}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 py-4 text-lg"
              >
                Start Focusing Now
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900/20 rounded-full px-8 py-4 text-lg"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Stay Focused
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Scientifically proven techniques combined with modern design
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 border-purple-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Timer className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Smart Timer</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Customizable Pomodoro sessions with background operation and smart notifications.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 border-purple-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Detailed Analytics</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Track your productivity with beautiful charts and insights.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 border-purple-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Streak Tracking</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Build consistent habits with daily streak tracking and goals.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Premium Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 lg:p-12 text-center text-white">
            <Crown className="w-16 h-16 mx-auto mb-6 text-yellow-300" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Unlock Premium Features
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Get unlimited custom timers, premium ambient sounds, detailed analytics, and more.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 max-w-4xl mx-auto">
              <div className="bg-white/20 rounded-lg p-4">
                <h4 className="font-semibold mb-1">Unlimited Timers</h4>
                <p className="text-sm opacity-75">Custom durations</p>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <h4 className="font-semibold mb-1">Premium Sounds</h4>
                <p className="text-sm opacity-75">Full sound library</p>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <h4 className="font-semibold mb-1">Cloud Sync</h4>
                <p className="text-sm opacity-75">Access anywhere</p>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <h4 className="font-semibold mb-1">No Ads</h4>
                <p className="text-sm opacity-75">Distraction-free</p>
              </div>
            </div>
            <Button 
              size="lg"
              onClick={() => window.location.href = '/api/login'}
              className="bg-white text-purple-600 hover:bg-gray-100 rounded-full px-8 py-4 text-lg font-semibold"
            >
              Try Free for 7 Days
            </Button>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <Users className="w-6 h-6 text-purple-600" />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              Trusted by thousands of productive people
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "FocusZen completely changed how I work. The analytics help me understand my productivity patterns.",
                author: "Sarah Chen, Designer"
              },
              {
                quote: "The ambient sounds and streak tracking keep me motivated throughout the day.",
                author: "Marcus Rodriguez, Developer"
              },
              {
                quote: "Simple, beautiful, and effective. Exactly what I needed for better focus.",
                author: "Emma Thompson, Writer"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="p-6 border-purple-100 dark:border-gray-700">
                <CardContent className="p-0">
                  <p className="text-gray-600 dark:text-gray-300 mb-4 italic">
                    "{testimonial.quote}"
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.author}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-purple-200/20 dark:border-gray-700/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">FocusZen</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            © 2025 FocusZen. Built for better focus and productivity.
          </p>
        </div>
      </footer>
    </div>
  );
}
