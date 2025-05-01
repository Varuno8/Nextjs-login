
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-eigengram-background to-eigengram-border">
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gradient">Eigengram</h1>
        <div className="flex gap-4">
          {isAuthenticated ? (
            <Button asChild>
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="outline">
                <Link to="/sign-in">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/sign-up">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </header>
      
      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-gradient">AI-Powered Healthcare</span> Solutions
              </h2>
              <p className="mt-6 text-xl text-eigengram-foreground/80">
                Connect with specialized healthcare AI models on a secure, 
                subscription-based platform designed for healthcare professionals.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <Link to={isAuthenticated ? "/dashboard" : "/sign-up"}>
                    Get Started
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/dashboard/services">
                    Explore Services
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-eigengram-primary/5 rounded-3xl transform rotate-3"></div>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8aGVhbHRoY2FyZSUyMHRlY2h8ZW58MHx8MHx8fDA%3D" 
                  alt="Healthcare AI technology" 
                  className="rounded-2xl shadow-xl"
                />
              </div>
            </div>
          </div>
        </section>
        
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-center mb-12">
              Our Healthcare AI Services
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-6">
                <div className="bg-eigengram-primary/10 p-3 rounded-full w-fit mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-eigengram-primary">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="m4.93 4.93 4.24 4.24"/>
                    <path d="m14.83 9.17 4.24-4.24"/>
                    <path d="m14.83 14.83 4.24 4.24"/>
                    <path d="m9.17 14.83-4.24 4.24"/>
                    <circle cx="12" cy="12" r="4"/>
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-2">Medical Imaging Analysis</h4>
                <p className="text-eigengram-muted">
                  AI-powered analysis of medical images including X-rays, MRIs, and CT scans.
                </p>
              </Card>
              
              <Card className="p-6">
                <div className="bg-eigengram-accent/10 p-3 rounded-full w-fit mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-eigengram-accent">
                    <path d="M17 20a5 5 0 0 0-10 0"/>
                    <line x1="12" y1="2" x2="12" y2="10"/>
                    <circle cx="12" cy="14" r="4"/>
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-2">Patient Risk Assessment</h4>
                <p className="text-eigengram-muted">
                  Predictive analytics tool that evaluates patient data to identify potential health risks.
                </p>
              </Card>
              
              <Card className="p-6">
                <div className="bg-eigengram-secondary/10 p-3 rounded-full w-fit mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-eigengram-secondary">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-2">Mental Health Analysis</h4>
                <p className="text-eigengram-muted">
                  AI model trained to analyze patterns and identify potential mental health concerns.
                </p>
              </Card>
            </div>
            
            <div className="text-center mt-12">
              <Button asChild size="lg">
                <Link to={isAuthenticated ? "/dashboard/services" : "/sign-up"}>
                  View All Services
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-eigengram-foreground text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4">Eigengram</h4>
              <p className="text-eigengram-muted">
                AI-powered healthcare solutions for medical professionals.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="hover:text-eigengram-accent">Home</Link></li>
                <li><Link to="/dashboard/services" className="hover:text-eigengram-accent">Services</Link></li>
                <li><Link to="/sign-in" className="hover:text-eigengram-accent">Sign In</Link></li>
                <li><Link to="/sign-up" className="hover:text-eigengram-accent">Sign Up</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <p className="text-eigengram-muted">
                1234 Healthcare Drive<br />
                San Francisco, CA 94103<br />
                contact@eigengram.com
              </p>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-eigengram-muted">
              © 2023 Eigengram. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
