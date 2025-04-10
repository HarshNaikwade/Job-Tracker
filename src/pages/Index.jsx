import { Link } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";

import Navbar from "../components/layout/Navbar";
import { APP_ICON_SRC, APP_NAME } from "../constants";

const features = [
  {
    title: "Track Applications",
    description: "Keep all your job applications organized in one place.",
  },
  {
    title: "Monitor Status",
    description: "Easily update and track the status of each application.",
  },
  {
    title: "Stay Organized",
    description: "Never miss a follow-up or interview opportunity again.",
  },
  {
    title: "Data Insights",
    description:
      "Gain insights into your job search progress and success rate.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 md:px-6 lg:pt-32 lg:pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center">
            <div className="lg:w-1/2 lg:pr-12 animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Track Your Job Applications with Ease
              </h1>
              <p className="mt-6 text-xl text-foreground/80 leading-relaxed">
                Stay organized during your job search with our intuitive job
                application tracker. Never miss a follow-up again.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="btn-primary py-3 px-8 text-center rounded-md text-lg"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="py-3 px-8 text-center border border-foreground/20 rounded-md text-lg hover:bg-foreground/5 transition-colors"
                >
                  Log In
                </Link>
              </div>
            </div>

            <div className="lg:w-1/2 mt-12 lg:mt-0 animate-fade-in animate-delay-200">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-2xl transform rotate-1"></div>
                <div className="relative bg-card rounded-2xl shadow-lg border p-6 transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">
                      Recent Applications
                    </h3>
                    <span className="text-xs text-foreground/60">5 of 12</span>
                  </div>

                  {[
                    {
                      company: "Monsters Inc.",
                      role: "Frontend Developer",
                      status: "Applied",
                    },
                    {
                      company: "SkyNet",
                      role: "AI Engineer",
                      status: "In Progress",
                    },
                    {
                      company: "Stark Industries",
                      role: "Software Engineer",
                      status: "Waiting",
                    },
                  ].map((app, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg mb-3 ${
                        index === 0
                          ? "bg-primary/10 border border-primary/20"
                          : "bg-secondary border"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{app.company}</p>
                          <p className="text-sm text-foreground/70">
                            {app.role}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            app.status === "Applied"
                              ? "bg-[hsl(var(--status-applied))] text-white"
                              : app.status === "In Progress"
                              ? "bg-[hsl(var(--status-in-progress))] text-black"
                              : "bg-[hsl(var(--status-waiting))] text-white"
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 md:px-6 bg-secondary/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Features Designed for Job Seekers
            </h2>
            <p className="mt-4 text-xl text-foreground/70 max-w-3xl mx-auto">
              Everything you need to organize and optimize your job search in
              one place.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card rounded-lg p-6 shadow-sm border hover:shadow-md transition-all animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-foreground/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-primary/5 to-primary/20 rounded-2xl p-8 md:p-12 shadow-lg animate-fade-in">
            <div className="md:flex items-center justify-between">
              <div className="md:w-2/3 mb-8 md:mb-0">
                <h2 className="text-3xl font-bold tracking-tight">
                  Ready to Streamline Your Job Search?
                </h2>
                <p className="mt-4 text-lg text-foreground/80 max-w-2xl">
                  Join thousands of job seekers who organize their applications
                  and increase their chances of landing their dream job.
                </p>
              </div>
              <div>
                <Link
                  to="/register"
                  className="inline-flex items-center btn-primary py-3 px-8 text-lg rounded-md group"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 md:px-6 bg-card border-t">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img
                src={APP_ICON_SRC}
                alt="App Icon"
                className="w-6 h-6 text-primary mr-2"
              />
              <span className="text-lg font-semibold">{APP_NAME}</span>
            </div>

            <div className="text-sm text-foreground/60">
              &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
