import { Link } from 'react-router-dom';
import { HiOutlineBookOpen, HiOutlineUserGroup, HiOutlineCalendar, HiOutlineLightningBolt } from 'react-icons/hi';

const features = [
  { icon: HiOutlineBookOpen, title: 'Study Materials', desc: 'Access notes, assignments, and resources shared by students across colleges.', color: 'from-blue-500 to-indigo-500' },
  { icon: HiOutlineUserGroup, title: 'Communities', desc: 'Join interest-based groups — from coding to startups — and connect with peers.', color: 'from-emerald-500 to-teal-500' },
  { icon: HiOutlineCalendar, title: 'Events & Opportunities', desc: 'Discover hackathons, workshops, internships, and more — all in one place.', color: 'from-amber-500 to-orange-500' },
  { icon: HiOutlineLightningBolt, title: 'AI Tools (Coming Soon)', desc: 'Smart study assistants, auto-summaries, and personalized recommendations.', color: 'from-purple-500 to-pink-500' },
];

const Home = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16 text-center">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary-500/10 text-primary-300 text-xs font-medium px-4 py-1.5 rounded-full border border-primary-500/20 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse"></span>
            Now in Beta — Join the revolution
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
            Your Entire
            <br />
            <span className="gradient-text">Student Universe</span>
            <br />
            in One Place
          </h1>

          <p className="text-lg sm:text-xl text-surface-200 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop juggling between 10 different apps. UniVoid brings together study materials,
            communities, events, and opportunities — built by students, for students.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-base px-8 py-3.5">
              Get Started — It's Free
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-3.5">
              Sign In
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-4 max-w-md mx-auto">
          {[
            { value: '500+', label: 'Notes Shared' },
            { value: '20+', label: 'Communities' },
            { value: '50+', label: 'Events' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</p>
              <p className="text-xs text-surface-200 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-4">
          Everything You Need, <span className="gradient-text">Nothing You Don't</span>
        </h2>
        <p className="text-surface-200 text-center mb-12 max-w-lg mx-auto">
          A streamlined platform designed to solve the fragmentation problem in student life.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <div key={feature.title} className="glass-card rounded-2xl p-6 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-surface-200 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <div className="glass-card rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-accent-500/10 pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to simplify your student life?</h2>
            <p className="text-surface-200 mb-8 max-w-md mx-auto">Join thousands of students who are already using UniVoid to stay organized and connected.</p>
            <Link to="/register" className="btn-primary text-base px-8 py-3.5">Create Your Account</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4 text-center">
        <p className="text-xs text-surface-700">© 2024 UniVoid. Built with ❤️ for students everywhere.</p>
      </footer>
    </div>
  );
};

export default Home;
