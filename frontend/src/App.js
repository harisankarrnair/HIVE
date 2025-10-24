import React, { useState, useEffect, createContext, useContext } from 'react';
import { Sun, Moon, User, Menu, X, ArrowLeft, ArrowRight, Home, FileText, Droplets, Utensils, Award, ShieldAlert, LogOut, Edit3, Save, XCircle, Clock, CheckCircle, Loader, Bell, Megaphone, ChevronDown, ShoppingCart } from 'lucide-react';

// --- MOCK DATA ---
const MOCK_USER = {
  name: 'Jack',
  email: 'jack2022@vitstudent.ac.in',
  regNo: '22BCE1722',
  room: 'A-303',
  block: 'Men\'s Hostel - I',
};

const MOCK_COMPLAINTS = [
  { id: 'C-101', category: 'Internet', description: 'Wi-Fi speed is very slow in my room.', status: 'Resolved', date: '2025-07-25' },
  { id: 'C-102', category: 'Electrical', description: 'The fan is making a loud noise.', status: 'In Progress', date: '2025-07-28' },
  { id: 'C-103', category: 'Plumbing', description: 'Leaky tap in the washroom.', status: 'Pending', date: '2025-07-30' },
];

const MOCK_EVENT_REGISTRATIONS = [
    { id: 'S-01', name: 'Inter-Block Cricket Tournament', date: '2025-08-10', time: '9:00 AM', venue: 'Main Ground', registered: true },
    { id: 'S-02', name: 'Chess Competition', date: '2025-08-12', time: '2:00 PM', venue: 'Common Room, Block II', registered: false },
    { id: 'S-03', name: 'Volleyball Friendly Match', date: '2025-08-15', time: '5:00 PM', venue: 'Volleyball Court', registered: false },
];

const INITIAL_SPORTS_AVAILABILITY = [
    { id: 'football', name: 'Football Ground', status: 'Open', timings: '6 AM - 9 PM', current: 18, max: 40, userCheckedIn: false },
    { id: 'basketball', name: 'Basketball Court', status: 'Open', timings: '6 AM - 9 PM', current: 8, max: 20, userCheckedIn: false },
    { id: 'cricket', name: 'Cricket Nets', status: 'Closed', timings: '4 PM - 7 PM', current: 0, max: 12, userCheckedIn: false },
    { id: 'badminton', name: 'Badminton Court', status: 'Open', timings: '6 AM - 10 PM', current: 3, max: 8, userCheckedIn: false },
    { id: 'volleyball', name: 'Volleyball Court', status: 'Open', timings: '4 PM - 8 PM', current: 11, max: 24, userCheckedIn: false },
    { id: 'carrom', name: 'Carrom (Common Room)', status: 'Open', timings: '24 Hours', current: 5, max: 16, userCheckedIn: false },
    { id: 'tt', name: 'Table Tennis', status: 'Open', timings: '6 AM - 10 PM', current: 1, max: 4, userCheckedIn: false },
    { id: 'chess', name: 'Chess (Common Room)', status: 'Open', timings: '24 Hours', current: 7, max: 12, userCheckedIn: false },
    { id: 'hockey', name: 'Hockey Ground', status: 'Closed', timings: '5 PM - 8 PM', current: 0, max: 30, userCheckedIn: false },
];

const INITIAL_MESS_CROWD = {
    'ras_sense': { id: 'ras_sense', name: 'Ras  Sense', current: 88, max: 150, userCheckedIn: false },
    'fusion': { id: 'fusion', name: 'Fusion', current: 45, max: 120, userCheckedIn: false },
};

const MOCK_LAUNDRY_STATUS = {
    'TKN101': { status: 'Ready for Pickup', details: 'Your clothes have been washed and ironed.' },
    'TKN234': { status: 'In Progress', details: 'Your clothes are currently being washed.' },
};

const INITIAL_VMART_STOCK = [
    { category: 'Snacks', items: [ { id: 'snk1', name: 'Lays Classic', count: 15 }, { id: 'snk2', name: 'Kurkure', count: 22 }, { id: 'snk3', name: 'Good Day Cookies', count: 0 } ] },
    { category: 'Beverages', items: [ { id: 'bev1', name: 'Coke (500ml)', count: 30 }, { id: 'bev2', name: 'Red Bull', count: 8 }, { id: 'bev3', name: 'Tropicana Juice', count: 12 } ] },
    { category: 'Cosmetics', items: [ { id: 'cos1', name: 'Nivea Facewash', count: 7 }, { id: 'cos2', name: 'Parachute Hair Oil', count: 0 }, { id: 'cos3', name: 'Dove Soap', count: 18 } ] },
    { category: 'Stationery', items: [ { id: 'stn1', name: 'Classmate Notebook', count: 25 }, { id: 'stn2', name: 'Pen (Blue)', count: 40 } ] },
];

const INITIAL_NOTIFICATIONS = [
    { id: 1, type: 'event', title: 'Cricket Tournament Reminder', body: 'Your match starts tomorrow at 9:00 AM.', read: false, time: '1h ago' },
    { id: 2, type: 'laundry', title: 'Laundry Ready', body: 'Your laundry with token TKN101 is ready for pickup.', read: false, time: '3h ago' },
    { id: 3, type: 'complaint', title: 'Complaint Resolved', body: 'Your complaint C-101 regarding slow Wi-Fi has been resolved.', read: true, time: '1d ago' },
];

const MOCK_ANNOUNCEMENTS = [
    { id: 1, title: 'Hostel Registration for Next Semester', date: '2025-07-30', body: 'The portal for hostel registration will be open from August 5th to August 10th. Please ensure you complete the process within the given timeframe. The registration link is: <a href="https://vtopcc.vit.ac.in/vtop/open/page" target="_blank" rel="noopener noreferrer" class="text-indigo-400 hover:underline">vtop.vit.ac.in/hostelreg</a>' },
    { id: 2, title: 'Scheduled Power Outage', date: '2025-07-28', body: 'Please be advised that there will be a scheduled power outage for maintenance in all blocks on August 2nd from 10:00 AM to 2:00 PM. We apologize for the inconvenience.' },
];


// --- CONTEXT ---
const AppContext = createContext();

// --- MAIN APP COMPONENT ---
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [page, setPage] = useState('login');
  const [history, setHistory] = useState(['login']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [userData, setUserData] = useState(MOCK_USER);
  const [sportsAvailability, setSportsAvailability] = useState(INITIAL_SPORTS_AVAILABILITY);
  const [messCrowd, setMessCrowd] = useState(INITIAL_MESS_CROWD);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  useEffect(() => {
    document.body.className = isDarkMode ? 'dark bg-gray-900' : 'light bg-gray-100';
  }, [isDarkMode]);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileMenuOpen && !event.target.closest('#profile-menu-container')) setIsProfileMenuOpen(false);
      if (isNotificationsOpen && !event.target.closest('#notifications-container')) setIsNotificationsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen, isNotificationsOpen]);


  const navigate = (newPage) => {
    if (newPage === page) return;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPage);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setPage(newPage);
    if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
    }
    setIsProfileMenuOpen(false);
    setIsNotificationsOpen(false);
  };

  const goBack = () => { if (historyIndex > 0) { setHistoryIndex(historyIndex - 1); setPage(history[historyIndex - 1]); } };
  const goForward = () => { if (historyIndex < history.length - 1) { setHistoryIndex(historyIndex + 1); setPage(history[historyIndex + 1]); } };
  const handleLogin = () => { setIsLoggedIn(true); navigate('dashboard'); };
  const handleLogout = () => { setIsLoggedIn(false); setHistory(['login']); setHistoryIndex(0); setPage('login'); setIsProfileMenuOpen(false); setIsAlertActive(false); };

  const addNotification = (newNotification) => {
    setNotifications(prev => [{...newNotification, id: Date.now(), read: false, time: 'Just now'}, ...prev]);
  };

  const contextValue = {
    navigate, isDarkMode, setIsDarkMode, isSidebarOpen, setIsSidebarOpen, user: userData, updateUser: setUserData, handleLogout,
    isProfileMenuOpen, setIsProfileMenuOpen, isAlertActive, setIsAlertActive, sportsAvailability, setSportsAvailability,
    messCrowd, setMessCrowd, notifications, setNotifications, addNotification, isNotificationsOpen, setIsNotificationsOpen,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className={`min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        {!isLoggedIn ? <LoginPage onLogin={handleLogin} /> : (
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <Header goBack={goBack} goForward={goForward} canGoBack={historyIndex > 0} canGoForward={historyIndex < history.length - 1} />
              <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gray-100 dark:bg-gray-900">
                <PageContent currentPage={page} />
              </main>
            </div>
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
}

// --- LAYOUT COMPONENTS ---

const Header = ({ goBack, goForward, canGoBack, canGoForward }) => {
  const { navigate, isDarkMode, setIsDarkMode, setIsSidebarOpen, handleLogout, isProfileMenuOpen, setIsProfileMenuOpen, notifications, isNotificationsOpen, setIsNotificationsOpen } = useContext(AppContext);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 text-gray-800 dark:text-gray-200 flex-shrink-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <button onClick={() => setIsSidebarOpen(prev => !prev)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <Menu size={24} />
            </button>
            <div className="flex items-center space-x-1">
                <button onClick={goBack} disabled={!canGoBack} className="p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700">
                  <ArrowLeft size={20} />
                </button>
                <button onClick={goForward} disabled={!canGoForward} className="p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700">
                  <ArrowRight size={20} />
                </button>
            </div>
          </div>
          <button onClick={() => navigate('dashboard')} className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-400 dark:to-purple-400 hover:opacity-80 transition-opacity">
              HIVE
          </button>
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate('announcements')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
              <Megaphone size={20} />
            </button>
            <div id="notifications-container" className="relative">
                <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 relative">
                    <Bell size={20} />
                    {unreadCount > 0 && <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>}
                </button>
                {isNotificationsOpen && <NotificationsDropdown />}
            </div>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div id="profile-menu-container" className="relative">
              <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="p-1.5 bg-gray-200 dark:bg-gray-700 rounded-full hover:ring-2 hover:ring-indigo-500 dark:hover:ring-indigo-400 transition-all">
                <User size={22} />
              </button>
              {isProfileMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 origin-top-right animate-in fade-in-0 zoom-in-95">
                  <button onClick={() => navigate('profile')} className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">Profile</button>
                  <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const Sidebar = () => {
    const { navigate, isSidebarOpen, setIsSidebarOpen, handleLogout } = useContext(AppContext);
    
    const navItems = [
        { name: 'Dashboard', icon: Home, page: 'dashboard' },
        { name: 'Announcements', icon: Megaphone, page: 'announcements' },
        { name: 'Complaints', icon: FileText, page: 'complaints' },
        { name: 'Laundry', icon: Droplets, page: 'laundry' },
        { name: 'Mess', icon: Utensils, page: 'mess' },
        { name: 'Sports & Activities', icon: Award, page: 'sports' },
        { name: 'V-Mart', icon: ShoppingCart, page: 'vmart' },
    ];

    return (
        <>
            <div 
                className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity lg:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsSidebarOpen(false)}
            ></div>
            <aside className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 w-60 z-40 flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 h-16">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Access</h2>
                </div>
                <nav className="flex-1 p-2 space-y-1">
                    {navItems.map(item => (
                        <button key={item.name} onClick={() => navigate(item.page)} className="w-full flex items-center px-3 py-2.5 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-600 dark:hover:text-white cursor-pointer transition-all duration-200 group">
                            <item.icon size={20} className="mr-3 group-hover:scale-110 transition-transform"/>
                            <span className="font-medium text-sm">{item.name}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                    <button onClick={handleLogout} className="w-full flex items-center px-3 py-2.5 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 cursor-pointer transition-all duration-200 group">
                        <LogOut size={20} className="mr-3 group-hover:scale-110 transition-transform"/>
                        <span className="font-medium text-sm">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

const NotificationsDropdown = () => {
    const { notifications, setNotifications } = useContext(AppContext);

    const markAsRead = (id) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    return (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl ring-1 ring-black ring-opacity-5 origin-top-right animate-in fade-in-0 zoom-in-95">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">No new notifications</p>
                ) : (
                    notifications.map(n => (
                        <div key={n.id} onClick={() => markAsRead(n.id)} className="flex items-start p-3 space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700/50">
                            {!n.read && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></div>}
                            <div className={`flex-1 ${n.read ? 'ml-5' : ''}`}>
                                <p className="font-semibold text-sm text-gray-800 dark:text-white">{n.title}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">{n.body}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{n.time}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};


// --- PAGE ROUTING ---
const PageContent = ({ currentPage }) => {
  switch (currentPage) {
    case 'dashboard': return <DashboardPage />;
    case 'profile': return <ProfilePage />;
    case 'complaints': return <ComplaintPage />;
    case 'laundry': return <LaundryPage />;
    case 'mess': return <MessPage />;
    case 'sports': return <SportsPage />;
    case 'vmart': return <VMartPage />;
    case 'announcements': return <AnnouncementsPage />;
    default: return <DashboardPage />;
  }
};

// --- PAGES ---

const LoginPage = ({ onLogin }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">HIVE</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Hostel Integrated Virtual Environment</p>
        </div>
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
          <div>
            <label htmlFor="email" className="text-sm font-bold text-gray-600 dark:text-gray-300 block">
              University Email
            </label>
            <input
              type="email"
              id="email"
              defaultValue="student@vitstudent.ac.in"
              className="w-full p-3 mt-1 text-gray-900 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-sm font-bold text-gray-600 dark:text-gray-300 block"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              defaultValue="password"
              className="w-full p-3 mt-1 text-gray-900 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full py-3 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transform hover:scale-105 transition-transform duration-200"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DashboardPage = () => {
    const { navigate, user, isAlertActive } = useContext(AppContext);
    const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

    const menuItems = [
        { name: 'File a Complaint', icon: FileText, page: 'complaints', color: 'blue' },
        { name: 'Laundry Services', icon: Droplets, page: 'laundry', color: 'green' },
        { name: 'Mess Details', icon: Utensils, page: 'mess', color: 'yellow' },
        { name: 'Sports & Activities', icon: Award, page: 'sports', color: 'purple' },
        { name: 'V-Mart Stock', icon: ShoppingCart, page: 'vmart', color: 'pink' },
    ];
    
    const colorClasses = {
        blue: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-600 dark:text-blue-300', ring: 'hover:ring-blue-500' },
        green: { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-600 dark:text-green-300', ring: 'hover:ring-green-500' },
        yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-600 dark:text-yellow-300', ring: 'hover:ring-yellow-500' },
        purple: { bg: 'bg-purple-100 dark:bg-purple-900/50', text: 'text-purple-600 dark:text-purple-300', ring: 'hover:ring-purple-500' },
        pink: { bg: 'bg-pink-100 dark:bg-pink-900/50', text: 'text-pink-600 dark:text-pink-300', ring: 'hover:ring-pink-500' },
    };

    return (
        <div className="space-y-8">
            {isAlertActive && (
                <div className="bg-red-600 text-white p-4 rounded-lg flex items-center justify-center space-x-3 animate-pulse">
                    <ShieldAlert size={24} />
                    <span className="font-bold text-lg">ALERT ACTIVE: Help is on the way.</span>
                </div>
            )}
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Welcome back, {user.name.split(' ')[0]}!</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Here's your hostel dashboard for today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {menuItems.map(item => (
                    <div key={item.name} onClick={() => navigate(item.page)} 
                         className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl flex flex-col items-start space-y-4 ${colorClasses[item.color].bg} ${colorClasses[item.color].ring} hover:ring-4`}>
                        <div className={`p-3 rounded-full ${colorClasses[item.color].bg} ring-8 ring-white dark:ring-gray-800`}>
                            <item.icon size={28} className={colorClasses[item.color].text} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">{item.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Click to manage</p>
                    </div>
                ))}
            </div>
            
            <div className="bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-6 rounded-2xl flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold flex items-center"><ShieldAlert className="mr-2"/> Medical Emergency</h3>
                    <p className="mt-1">In case of a medical emergency, click this button for immediate assistance.</p>
                </div>
                <button onClick={() => setIsEmergencyModalOpen(true)} className="px-6 py-3 font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-900 transform hover:scale-105 transition-transform duration-200">
                    Raise Alert
                </button>
            </div>
            
            <EmergencyModal isOpen={isEmergencyModalOpen} onClose={() => setIsEmergencyModalOpen(false)} />
        </div>
    );
};

const ProfilePage = () => {
    const { user, updateUser } = useContext(AppContext);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState(user);

    useEffect(() => { setFormData(user); }, [user]);

    const handleInputChange = (e) => { setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })); };
    const handleSave = () => { updateUser(formData); setIsEditMode(false); };
    const handleCancel = () => { setFormData(user); setIsEditMode(false); };

    const ProfileField = ({ label, value, name, isEditing }) => (
        <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
            {isEditing ? (
                <input type="text" name={name} value={value} onChange={handleInputChange} className="mt-1 w-full p-2 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            ) : ( <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{value}</dd> )}
        </div>
    );
    
    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Profile</h1>
                {!isEditMode && (
                    <button onClick={() => setIsEditMode(true)} className="flex items-center space-x-2 px-4 py-2 font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                        <Edit3 size={18}/>
                        <span>Edit Profile</span>
                    </button>
                )}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                <div className="flex flex-col md:flex-row items-center md:space-x-8">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mb-6 md:mb-0">
                        <div className="w-24 h-24 bg-indigo-500 rounded-full flex items-center justify-center">
                            <User size={60} className="text-white"/>
                        </div>
                    </div>
                    <div className="text-center md:text-left flex-1">
                        {isEditMode ? (
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="text-3xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-indigo-500 focus:outline-none w-full" />
                        ) : ( <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{formData.name}</h2> )}
                        <p className="text-indigo-500 dark:text-indigo-400 text-lg">{formData.email}</p>
                    </div>
                </div>
                <div className="mt-10 border-t border-gray-200 dark:border-gray-700 pt-8">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                        <ProfileField label="Registration No." value={formData.regNo} name="regNo" isEditing={isEditMode} />
                        <ProfileField label="Block" value={formData.block} name="block" isEditing={isEditMode} />
                        <ProfileField label="Room No." value={formData.room} name="room" isEditing={isEditMode} />
                    </dl>
                </div>
                {isEditMode && (
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                        <button onClick={handleCancel} className="flex items-center space-x-2 px-4 py-2 font-bold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">
                            <XCircle size={18}/>
                            <span>Cancel</span>
                        </button>
                        <button onClick={handleSave} className="flex items-center space-x-2 px-4 py-2 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700">
                            <Save size={18}/>
                            <span>Save Changes</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const ComplaintPage = () => {
    const [complaints, setComplaints] = useState(MOCK_COMPLAINTS);
    const [showForm, setShowForm] = useState(false);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            case 'In Progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
            case 'Pending': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };
    
    const handleNewComplaint = (e) => {
        e.preventDefault();
        const newComplaint = {
            id: `C-${Math.floor(Math.random() * 900) + 100}`,
            category: e.target.category.value,
            description: e.target.description.value,
            status: 'Pending',
            date: new Date().toISOString().split('T')[0],
        };
        setComplaints([newComplaint, ...complaints]);
        setShowForm(false);
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Complaint Management</h1>
                <button onClick={() => setShowForm(!showForm)} className="px-5 py-2.5 font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 transform hover:scale-105 transition-transform duration-200">
                    {showForm ? 'Cancel' : 'New Complaint'}
                </button>
            </div>
            
            {showForm && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 transition-all duration-500">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">File a New Complaint</h2>
                    <form onSubmit={handleNewComplaint} className="space-y-6">
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                            <select id="category" name="category" className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-700 border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option>Electrical</option>
                                <option>Plumbing</option>
                                <option>Internet</option>
                                <option>Housekeeping</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                            <textarea id="description" name="description" rows="4" required className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-700 border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Please describe the issue in detail..."></textarea>
                        </div>
                        <div>
                            <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload Image (Optional)</label>
                            <input type="file" id="image" name="image" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/50 dark:file:text-indigo-300 dark:hover:file:bg-indigo-900"/>
                        </div>
                        <div className="text-right">
                            <button type="submit" className="px-6 py-3 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800">Submit Complaint</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {complaints.map(c => (
                            <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{c.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{c.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{c.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(c.status)}`}>
                                        {c.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const LaundryPage = () => {
    const [bookedSlot, setBookedSlot] = useState(null);
    const [token, setToken] = useState(null);
    const [laundryTokenInput, setLaundryTokenInput] = useState('');
    const [laundryStatus, setLaundryStatus] = useState(null);
    const [isLoadingStatus, setIsLoadingStatus] = useState(false);

    const handleBooking = (slot) => {
        setBookedSlot(slot);
        setToken(`LDRY-${Math.floor(1000 + Math.random() * 9000)}`);
    };

    const handleTrackLaundry = (e) => {
        e.preventDefault();
        setIsLoadingStatus(true);
        setLaundryStatus(null);
        setTimeout(() => {
            const status = MOCK_LAUNDRY_STATUS[laundryTokenInput.toUpperCase()];
            setLaundryStatus(status || { status: 'Not Found', details: 'No laundry found with this token number.' });
            setIsLoadingStatus(false);
        }, 1000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Laundry Services</h1>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Track Your Laundry</h2>
                <form onSubmit={handleTrackLaundry} className="flex items-center space-x-3">
                    <input type="text" value={laundryTokenInput} onChange={(e) => setLaundryTokenInput(e.target.value)} placeholder="Enter Token Number (e.g., TKN101)" className="w-full p-3 bg-gray-100 dark:bg-gray-700 border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <button type="submit" className="px-6 py-3 font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700" disabled={isLoadingStatus}>
                        {isLoadingStatus ? <Loader className="animate-spin" /> : 'Track'}
                    </button>
                </form>
                {laundryStatus && (
                    <div className={`mt-6 p-4 rounded-lg ${laundryStatus.status === 'Not Found' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'}`}>
                        <p className="font-bold">Status: {laundryStatus.status}</p>
                        <p>{laundryStatus.details}</p>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Book a Laundry Slot</h2>
                {bookedSlot ? (
                    <div className="bg-green-100 dark:bg-green-900/50 border-l-4 border-green-500 text-green-700 dark:text-green-300 p-6 rounded-2xl text-center">
                        <h3 className="text-2xl font-bold">Booking Confirmed!</h3>
                        <p className="mt-2 text-lg">Your slot is booked for <span className="font-bold">{bookedSlot}</span>.</p>
                        <p className="mt-4 text-xl font-bold">Your Token Number is:</p>
                        <p className="text-4xl font-mono font-extrabold tracking-widest mt-2">{token}</p>
                        <button onClick={() => { setBookedSlot(null); setToken(null); }} className="mt-6 px-6 py-2 font-bold text-white bg-red-600 rounded-lg hover:bg-red-700">Cancel Booking</button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {['9-10 AM', '10-11 AM', '11-12 PM', '2-3 PM', '3-4 PM', '4-5 PM'].map(slot => (
                                <button key={slot} onClick={() => handleBooking(slot)} className="p-4 text-center font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-600 transition-all duration-200 transform hover:scale-105">
                                    {slot}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-8">Note: As per hostel rules, you can only book one slot every seven days.</p>
                    </>
                )}
            </div>
        </div>
    );
};

const MessPage = () => {
    const { messCrowd, setMessCrowd } = useContext(AppContext);
    const [day] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase());
    const [rating, setRating] = useState(0);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    
    const MOCK_MESS_MENU = {
      monday: { breakfast: 'Idli, Sambar, Chutney', lunch: 'Roti, Dal, Rice, Veg Curry', dinner: 'Chapathi, Paneer Butter Masala' },
      tuesday: { breakfast: 'Poha, Jalebi', lunch: 'Rice, Sambar, Rasam, Poriyal', dinner: 'Dosa, Chutney' },
      wednesday: { breakfast: 'Pongal, Vada', lunch: 'Veg Biryani, Raita', dinner: 'Roti, Aloo Gobi' },
      thursday: { breakfast: 'Upma, Kesari', lunch: 'Lemon Rice, Curd Rice', dinner: 'Parotta, Veg Kurma' },
      friday: { breakfast: 'Masala Dosa, Chutney', lunch: 'Roti, Dal Fry, Jeera Rice', dinner: 'Fried Rice, Gobi Manchurian' },
      saturday: { breakfast: 'Puri, Aloo Masala', lunch: 'Special Meal', dinner: 'Chapathi, Chana Masala' },
      sunday: { breakfast: 'Aloo Paratha, Curd', lunch: 'Non-Veg Special/Paneer', dinner: 'Idiyappam, Coconut Milk' },
    };

    const handleCheckIn = (messId) => {
        setMessCrowd(prev => {
            const otherMessId = messId === 'ras_sense' ? 'fusion' : 'ras_sense';
            const newCrowd = { ...prev };

            if (newCrowd[otherMessId].userCheckedIn) {
                newCrowd[otherMessId] = { ...newCrowd[otherMessId], current: Math.max(0, newCrowd[otherMessId].current - 1), userCheckedIn: false };
            }

            newCrowd[messId] = { ...newCrowd[messId], current: newCrowd[messId].current + 1, userCheckedIn: true };
            
            return newCrowd;
        });
    };

    const handleCheckOut = (messId) => {
        setMessCrowd(prev => ({
            ...prev,
            [messId]: { ...prev[messId], current: Math.max(0, prev[messId].current - 1), userCheckedIn: false }
        }));
    };

    const handleFeedbackSubmit = (e) => {
        e.preventDefault();
        setFeedbackSubmitted(true);
        setTimeout(() => setFeedbackSubmitted(false), 3000);
    };

    const CrowdCard = ({ mess }) => {
        const percentage = Math.min(100, (mess.current / mess.max) * 100);
        const getProgressBarColor = () => {
            if (percentage > 80) return 'bg-red-500';
            if (percentage > 50) return 'bg-yellow-500';
            return 'bg-green-500';
        };

        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{mess.name}</h3>
                <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Crowd Level</span>
                    <span className="font-semibold text-gray-800 dark:text-white">{mess.current} / {mess.max}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                    <div className={`${getProgressBarColor()} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                </div>
                {mess.userCheckedIn ? (
                    <button onClick={() => handleCheckOut(mess.id)} className="w-full mt-4 py-2 font-bold text-white bg-red-600 rounded-lg hover:bg-red-700">Check-out</button>
                ) : (
                    <button onClick={() => handleCheckIn(mess.id)} className="w-full mt-4 py-2 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700">Check-in</button>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Mess Details</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CrowdCard mess={messCrowd.ras_sense} />
                <CrowdCard mess={messCrowd.fusion} />
            </div>
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Weekly Mess Menu</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Day</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Breakfast</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Lunch</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dinner</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {Object.entries(MOCK_MESS_MENU).map(([d, meals]) => (
                                    <tr key={d} className={`${d === day ? 'bg-indigo-50 dark:bg-indigo-900/40' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'} transition-colors`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white capitalize">{d}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{meals.breakfast}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{meals.lunch}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{meals.dinner}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Meal Feedback</h2>
                    {feedbackSubmitted ? (
                        <div className="text-center p-8">
                            <h3 className="text-xl font-bold text-green-600 dark:text-green-400">Thank you!</h3>
                            <p className="text-gray-600 dark:text-gray-300 mt-2">Your feedback has been submitted.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                            <h3 className="font-semibold text-gray-800 dark:text-white">Rate today's meal:</h3>
                            <div className="flex justify-center space-x-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button type="button" key={star} onClick={() => setRating(star)} className="text-3xl transition-transform transform hover:scale-125">
                                        {star <= rating ? '⭐' : '✩'}
                                    </button>
                                ))}
                            </div>
                            <div>
                                <label htmlFor="comments" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Comments (Optional)</label>
                                <textarea id="comments" rows="3" className="mt-1 block w-full p-3 bg-gray-100 dark:bg-gray-700 border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Any suggestions?"></textarea>
                            </div>
                            <button type="submit" className="w-full py-3 font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Submit Feedback</button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

const SportsPage = () => {
    const [activeTab, setActiveTab] = useState('availability');
    const { sportsAvailability, setSportsAvailability } = useContext(AppContext);
    const [registrations, setRegistrations] = useState(MOCK_EVENT_REGISTRATIONS);

    const handleCheckIn = (venueId) => {
        setSportsAvailability(prev => {
            let alreadyCheckedInVenue = prev.find(v => v.userCheckedIn);
            return prev.map(venue => {
                // If this is the venue we are checking out of, update it
                if (alreadyCheckedInVenue && venue.id === alreadyCheckedInVenue.id) {
                    return { ...venue, current: Math.max(0, venue.current - 1), userCheckedIn: false };
                }
                // If this is the new venue we are checking into, update it
                if (venue.id === venueId) {
                    return { ...venue, current: venue.current + 1, userCheckedIn: true };
                }
                // Otherwise, return the venue as is
                return venue;
            });
        });
    };

    const handleCheckOut = (venueId) => {
        setSportsAvailability(prev => prev.map(venue => 
            venue.id === venueId ? { ...venue, current: Math.max(0, venue.current - 1), userCheckedIn: false } : venue
        ));
    };
    
    const handleRegister = (id) => {
        setRegistrations(registrations.map(s => s.id === id ? { ...s, registered: true } : s));
    };
    
    const VenueCard = ({ venue }) => {
        const percentage = venue.max > 0 ? Math.min(100, (venue.current / venue.max) * 100) : 0;
        const getProgressBarColor = () => {
            if (percentage > 80) return 'bg-red-500';
            if (percentage > 50) return 'bg-yellow-500';
            return 'bg-green-500';
        };

        return (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg flex flex-col space-y-3">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">{venue.name}</h3>
                    <div className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${venue.status === 'Open' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'}`}>
                        <div className={`w-2 h-2 rounded-full ${venue.status === 'Open' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span>{venue.status}</span>
                    </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock size={14} />
                    <span>{venue.timings}</span>
                </div>
                <div>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                        <span>Crowd Level</span>
                        <span className="font-semibold text-gray-800 dark:text-white">{venue.current} / {venue.max}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div className={`${getProgressBarColor()} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                    </div>
                </div>
                 {venue.userCheckedIn ? (
                    <button onClick={() => handleCheckOut(venue.id)} className="w-full mt-2 py-2 font-bold text-white bg-red-600 rounded-lg hover:bg-red-700">Check-out</button>
                ) : (
                    <button onClick={() => handleCheckIn(venue.id)} disabled={venue.status === 'Closed'} className="w-full mt-2 py-2 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed">Check-in</button>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Sports & Activities</h1>
            <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-xl mb-6">
                <button onClick={() => setActiveTab('availability')} className={`w-full py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'availability' ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'}`}>
                    Availability
                </button>
                <button onClick={() => setActiveTab('registrations')} className={`w-full py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'registrations' ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50'}`}>
                    Registrations
                </button>
            </div>

            {activeTab === 'availability' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sportsAvailability.map(venue => <VenueCard key={venue.id} venue={venue} />)}
                </div>
            )}

            {activeTab === 'registrations' && (
                 <div className="space-y-6">
                    {registrations.map(sport => (
                        <div key={sport.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center transition-all duration-300 hover:shadow-xl hover:scale-105">
                            <div className="mb-4 sm:mb-0">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{sport.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {sport.date} at {sport.time} | Venue: {sport.venue}
                                </p>
                            </div>
                            {sport.registered ? (
                                <span className="px-4 py-2 text-sm font-semibold text-green-800 bg-green-200 dark:text-green-200 dark:bg-green-800/50 rounded-full flex items-center space-x-2"><CheckCircle size={16}/><span>Registered</span></span>
                            ) : (
                                <button onClick={() => handleRegister(sport.id)} className="px-5 py-2.5 font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Register</button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const VMartPage = () => {
    const [openCategory, setOpenCategory] = useState(INITIAL_VMART_STOCK.length > 0 ? INITIAL_VMART_STOCK[0].category : null);
    const { addNotification } = useContext(AppContext);

    const handleNotify = (itemName) => {
        addNotification({
            type: 'vmart',
            title: 'V-Mart Stock Alert',
            body: `We'll notify you when ${itemName} is back in stock.`
        });
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">V-Mart Stock</h1>
            <div className="space-y-4">
                {INITIAL_VMART_STOCK.map(category => (
                    <div key={category.category} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                        <button onClick={() => setOpenCategory(openCategory === category.category ? null : category.category)} className="w-full flex justify-between items-center p-5 text-left">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{category.category}</h2>
                            <ChevronDown className={`transition-transform duration-300 ${openCategory === category.category ? 'rotate-180' : ''}`} />
                        </button>
                        {openCategory === category.category && (
                            <div className="px-5 pb-5">
                                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {category.items.map(item => (
                                        <li key={item.id} className="py-3 flex justify-between items-center">
                                            <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                                            {item.count > 0 ? (
                                                <span className="px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 dark:text-green-200 dark:bg-green-800/50 rounded-full">{item.count} in stock</span>
                                            ) : (
                                                <div className="flex items-center space-x-3">
                                                    <span className="px-3 py-1 text-sm font-semibold text-red-800 bg-red-100 dark:text-red-200 dark:bg-red-800/50 rounded-full">Out of Stock</span>
                                                    <button onClick={() => handleNotify(item.name)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Notify Me</button>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const AnnouncementsPage = () => {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Announcements</h1>
            <div className="space-y-6">
                {MOCK_ANNOUNCEMENTS.map(ann => (
                    <div key={ann.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{ann.title}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">Posted on: {ann.date}</p>
                        <div className="text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: ann.body }}></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const EmergencyModal = ({ isOpen, onClose }) => {
    const { setIsAlertActive } = useContext(AppContext);
    const [confirmed, setConfirmed] = useState(false);
    const [alertSent, setAlertSent] = useState(false);

    const handleConfirm = () => {
        setConfirmed(true);
        setTimeout(() => {
            setAlertSent(true);
            setIsAlertActive(true);
            setTimeout(() => {
                onClose();
                setConfirmed(false);
                setAlertSent(false);
            }, 2000);
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center transform transition-all scale-95 animate-in fade-in-0 zoom-in-95">
                {!alertSent ? (
                    <>
                        <ShieldAlert size={60} className="mx-auto text-red-500 mb-4"/>
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Emergency Alert</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-4">
                            Are you sure you want to raise a medical emergency alert? This will immediately notify the warden and health officials.
                        </p>
                        <div className="mt-8 flex justify-center space-x-4">
                            <button onClick={onClose} className="px-8 py-3 font-bold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
                                Cancel
                            </button>
                            <button onClick={handleConfirm} disabled={confirmed} className="px-8 py-3 font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-red-400 dark:disabled:bg-red-800 disabled:cursor-wait relative">
                                {confirmed ? 'Sending...' : 'Yes, I\'m Sure'}
                                {confirmed && <div className="absolute inset-0 flex items-center justify-center"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="animate-in fade-in-0">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                           <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Alert Sent!</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Help is on the way. Please remain calm.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
