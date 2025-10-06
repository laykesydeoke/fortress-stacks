'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { isUserSignedIn, connectWallet } from '@/lib/stacks';
import Link from 'next/link';
import { 
  ArrowRight, 
  Shield, 
  TrendingUp, 
  Zap, 
  Bitcoin, 
  Layers, 
  Globe, 
  BarChart3,
  CheckCircle,
  ArrowUpRight,
  Award,
  Users,
  Activity,
  Sparkles,
  Lock,
  Coins
} from 'lucide-react';

// Particle component for background effect
const ParticleBackground = () => {
  useEffect(() => {
    const particles = Array.from({ length: 50 }, (_, i) => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 20 + 's';
      particle.style.animationDuration = (15 + Math.random() * 10) + 's';
      return particle;
    });

    const container = document.querySelector('.particles');
    if (container) {
      particles.forEach(particle => container.appendChild(particle));
    }

    return () => {
      if (container) {
        particles.forEach(particle => {
          if (container.contains(particle)) {
            container.removeChild(particle);
          }
        });
      }
    };
  }, []);

  return <div className="particles"></div>;
};

export default function FortressStacksLandingPage() {
  const [isClient, setIsClient] = useState(false);
  const [userConnected, setUserConnected] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setUserConnected(isUserSignedIn());
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center web3-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-bitcoin-neon mx-auto mb-4"></div>
          <div className="text-neon-bitcoin text-lg font-semibold">Loading FortressStacks Command Center...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="web3-bg">
      <ParticleBackground />
      
      {/* Navigation */}
      <nav className="nav-web3 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-bitcoin-neon to-stacks-neon flex items-center justify-center">
              <img src="/fortress-logo.png" alt="FortressStacks" className="w-12 h-12" />
            </div>
            <span className="text-xl font-bold text-hologram">FortressStacks</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#about" className="nav-link">About</a>
          </div>
          
          <div className="flex items-center space-x-4">
            {userConnected ? (
              <Link href="/dashboard">
                <button className="btn-web3">
                  <span className="flex items-center gap-2">
                    Dashboard <ArrowRight className="w-4 h-4" />
                  </span>
                </button>
              </Link>
            ) : (
              <button 
                onClick={connectWallet}
                className="btn-ghost"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-bitcoin-neon/10 text-bitcoin-neon text-sm font-medium border border-bitcoin-neon/20">
              🏰 Institutional-Grade Command Center
            </span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
            Command the{' '}
            <span className="text-hologram">Bitcoin balance sheet</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            Institutional-grade command center for Bitcoin treasuries built on{' '}
            <span className="text-neon-stacks">Stacks</span>, unifying live payments, automated policies, and{' '}
            <span className="text-neon-bitcoin">yield governance</span> under a single secure roof.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            {userConnected ? (
              <Link href="/dashboard">
                <button className="btn-bitcoin text-lg px-12 py-4">
                  <span className="flex items-center gap-3">
                    Launch Command Center <Sparkles className="w-5 h-5" />
                  </span>
                </button>
              </Link>
            ) : (
              <button 
                onClick={connectWallet}
                className="btn-bitcoin text-lg px-12 py-4"
              >
                <span className="flex items-center gap-3">
                  Connect Wallet <Zap className="w-5 h-5" />
                </span>
              </button>
            )}
            <Link href="/checkout-demo">
              <button className="btn-ghost text-lg px-12 py-4">
                <span className="flex items-center gap-3">
                  View Live Demo <ArrowUpRight className="w-5 h-5" />
                </span>
              </button>
            </Link>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="metric-card">
              <div className="metric-value">$1T+</div>
              <div className="metric-label">Bitcoin Market Cap Unlocked</div>
            </div>
            <div className="metric-card">
              <div className="metric-value text-neon-stacks">99.9%</div>
              <div className="metric-label">sBTC Bridge Reliability</div>
            </div>
            <div className="metric-card">
              <div className="metric-value text-gradient">25%</div>
              <div className="metric-label">Average APY Achievable</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">
              Why Choose <span className="text-gradient">FortressStacks</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Institutional-grade command center for Bitcoin treasuries with fortified security and operational clarity
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="neon-card-bitcoin">
              <div className="flex items-center justify-between mb-4">
                <img src="/fortress-logo.png" alt="FortressStacks" className="w-16 h-16" />
                <div className="w-16 h-16 rounded-full bg-bitcoin-neon/20 flex items-center justify-center">
                  <img src="/fortress-logo.png" alt="FortressStacks" className="w-12 h-12" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-neon-bitcoin">Real sBTC Integration</h3>
              <p className="text-gray-300 mb-4">
                Direct integration with official sBTC protocol. No mocks, no demos - real Bitcoin on Stacks.
              </p>
              <div className="flex items-center text-sm text-bitcoin-neon">
                <CheckCircle className="w-4 h-4 mr-2" />
                Live on Testnet & Mainnet
              </div>
            </div>

            <div className="neon-card-stacks">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-stacks-neon" />
                <div className="w-12 h-12 rounded-full bg-stacks-neon/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-stacks-neon" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-neon-stacks">Policy-Driven Treasury</h3>
              <p className="text-gray-300 mb-4">
                Automated treasury management with threshold-based rebalancing and yield optimization.
              </p>
              <div className="flex items-center text-sm text-stacks-neon">
                <CheckCircle className="w-4 h-4 mr-2" />
                Smart Contract Automation
              </div>
            </div>

            <div className="neon-card">
              <div className="flex items-center justify-between mb-4">
                <Shield className="w-8 h-8 text-cyber-blue" />
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-cyber-blue" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gradient">Enterprise Security</h3>
              <p className="text-gray-300 mb-4">
                Bank-grade security with post-conditions, hardware wallet support, and audit trails.
              </p>
              <div className="flex items-center text-sm text-cyber-blue">
                <CheckCircle className="w-4 h-4 mr-2" />
                Audited Smart Contracts
              </div>
            </div>

            <div className="neon-card">
              <div className="flex items-center justify-between mb-4">
                <BarChart3 className="w-8 h-8 text-cyber-green" />
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-cyber-green" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gradient">Real-time Analytics</h3>
              <p className="text-gray-300 mb-4">
                Professional portfolio tracking with live blockchain data and performance insights.
              </p>
              <div className="flex items-center text-sm text-cyber-green">
                <CheckCircle className="w-4 h-4 mr-2" />
                Live Dashboard Updates
              </div>
            </div>

            <div className="neon-card">
              <div className="flex items-center justify-between mb-4">
                <Layers className="w-8 h-8 text-cyber-pink" />
                <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center">
                  <Layers className="w-6 h-6 text-cyber-pink" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gradient">Automated Optimization</h3>
              <p className="text-gray-300 mb-4">
                Smart contract-based rebalancing and yield optimization across multiple protocols.
              </p>
              <div className="flex items-center text-sm text-cyber-pink">
                <CheckCircle className="w-4 h-4 mr-2" />
                Set & Forget Strategies
              </div>
            </div>

            <div className="neon-card">
              <div className="flex items-center justify-between mb-4">
                <Globe className="w-8 h-8 text-cyber-purple" />
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-cyber-purple" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gradient">Institutional Ready</h3>
              <p className="text-gray-300 mb-4">
                Built for institutions with compliance tools, reporting, and multi-user support.
              </p>
              <div className="flex items-center text-sm text-cyber-purple">
                <CheckCircle className="w-4 h-4 mr-2" />
                Enterprise Features
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">
              How FortressStacks <span className="text-hologram">Works</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Four simple steps to commanding your Bitcoin balance sheet
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-bitcoin-neon to-bitcoin-primary flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-neon-bitcoin">Connect Wallet</h3>
              <p className="text-gray-300">
                Connect your Stacks wallet (Leather, Xverse) to access professional treasury tools
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-stacks-neon to-stacks-primary flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-neon-stacks">Bridge to sBTC</h3>
              <p className="text-gray-300">
                Convert Bitcoin to sBTC using the official bridge with real-time status tracking
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyber-blue to-cyber-green flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gradient">Deploy Policies</h3>
              <p className="text-gray-300">
                Set threshold-based policies for automated treasury management and rebalancing
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyber-pink to-cyber-purple flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gradient">Earn & Monitor</h3>
              <p className="text-gray-300">
                Watch your Bitcoin work with real-time analytics and automated optimization
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="web3-glass rounded-3xl p-12">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-bold mb-6">
                About <span className="text-hologram">FortressStacks</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                Command the Bitcoin balance sheet. Built on the Stacks blockchain, 
                FortressStacks is the fortified command center where Bitcoin cash flow meets disciplined governance.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-bitcoin-neon/20 flex items-center justify-center flex-shrink-0">
                      <Lock className="w-6 h-6 text-bitcoin-neon" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-neon-bitcoin">Security First</h3>
                      <p className="text-gray-300">
                        Built with institutional-grade security standards and post-condition enforcement
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-stacks-neon/20 flex items-center justify-center flex-shrink-0">
                      <Coins className="w-6 h-6 text-stacks-neon" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-neon-stacks">Real sBTC</h3>
                      <p className="text-gray-300">
                        Uses official sBTC protocol with 1:1 Bitcoin backing and full transparency
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-cyber-blue/20 flex items-center justify-center flex-shrink-0">
                      <Activity className="w-6 h-6 text-cyber-blue" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-gradient">Policy-Driven</h3>
                      <p className="text-gray-300">
                        Automated treasury management with threshold-based policies and real transfers
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="metric-card">
                  <div className="metric-value">100%</div>
                  <div className="metric-label">Real Transactions</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value text-neon-stacks">24/7</div>
                  <div className="metric-label">Availability</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value text-gradient">1:1</div>
                  <div className="metric-label">BTC Backing</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value text-neon-bitcoin">∞</div>
                  <div className="metric-label">Scalability</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">
            Ready to Optimize Your{' '}
            <span className="text-hologram">Bitcoin Treasury</span>?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join the future of professional Bitcoin management with real treasury flows and live blockchain integration
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {userConnected ? (
              <Link href="/dashboard">
                <button className="btn-bitcoin text-lg px-12 py-4">
                  <span className="flex items-center gap-3">
                    Launch Command Center <Sparkles className="w-5 h-5" />
                  </span>
                </button>
              </Link>
            ) : (
              <button 
                onClick={connectWallet}
                className="btn-bitcoin text-lg px-12 py-4"
              >
                <span className="flex items-center gap-3">
                  Get Started <ArrowRight className="w-5 h-5" />
                </span>
              </button>
            )}
            <Link href="/checkout-demo">
              <button className="btn-ghost text-lg px-12 py-4">
                <span className="flex items-center gap-3">
                  Try Demo <Globe className="w-5 h-5" />
                </span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-bitcoin-neon to-stacks-neon flex items-center justify-center">
                <img src="/fortress-logo.png" alt="FortressStacks" className="w-12 h-12" />
              </div>
              <div>
                <span className="text-xl font-bold text-hologram">FortressStacks</span>
                <p className="text-sm text-gray-400">Command the Bitcoin balance sheet</p>
              </div>
            </div>
            
            <div className="text-gray-400 text-sm text-center md:text-right">
              <p>© 2024 FortressStacks. Built on Bitcoin & Stacks.</p>
              <p className="mt-1">Command the Bitcoin balance sheet</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}