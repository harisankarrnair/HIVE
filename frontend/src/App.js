import React, { useState, useEffect, createContext, useContext } from 'react';
import { Sun, Moon, User, Menu, X, ArrowLeft, ArrowRight, Home, FileText, Droplets, Utensils, Award, ShieldAlert, LogOut, Edit3, Save, XCircle, Clock, CheckCircle, Loader, Bell, Megaphone, ChevronDown, ShoppingCart, Eye, EyeOff } from 'lucide-react';
// --- API CONFIGURATION ---
const API_BASE_URL = 'http://localhost:5000/api'; 

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




const INITIAL_NOTIFICATIONS = [
    { id: 1, type: 'event', title: 'Cricket Tournament Reminder', body: 'Your match starts tomorrow at 9:00 AM.', read: false, time: '1h ago' },
    { id: 2, type: 'laundry', title: 'Laundry Ready', body: 'Your laundry with token TKN101 is ready for pickup.', read: false, time: '3h ago' },
    { id: 3, type: 'complaint', title: 'Complaint Resolved', body: 'Your complaint C-101 regarding slow Wi-Fi has been resolved.', read: true, time: '1d ago' },
];


// --- CONTEXT ---
const AppContext = createContext();

// --- API FETCH FUNCTIONS ---

const loginUser = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || 'Login failed');
        }

        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error('API Login Error:', error);
        throw error;
    }
};

const registerUser = async (userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || 'Registration failed');
        }

        const newUser = await response.json();
        return newUser;
    } catch (error) {
        console.error('API Registration Error:', error);
        throw error;
    }
};
// --- API FETCH FUNCTIONS (In App.js) ---

// 🚩 MODIFIED: fetchComplaints now requires a userId
const fetchComplaints = async (userId) => {
    if (!userId) {
        console.error('Error: Cannot fetch complaints without a User ID.');
        return [];
    }
    try {
        // Append the userId to the URL query string
        const response = await fetch(`${API_BASE_URL}/complaints?userId=${userId}`); 
        if (!response.ok) throw new Error('Failed to fetch complaints');
        const data = await response.json();
        return data.map((c, index) => ({
            id: c._id || `C-${index + 1}`,
            category: c.category,
            description: c.description,
            status: c.status,
            date: new Date(c.date).toISOString().split('T')[0],
        })).sort((a, b) => new Date(b.date) - new Date(a.date)); 
    } catch (error) {
        console.error('Error fetching complaints:', error);
        return []; 
    }
};

// 🚩 MODIFIED: submitComplaint now requires a userId
const submitComplaint = async (complaintData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/complaints`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(complaintData), // complaintData must include userId
        });
        if (!response.ok) throw new Error('Failed to submit complaint');
        const newComplaint = await response.json();
        return {
            id: newComplaint._id,
            category: newComplaint.category,
            description: newComplaint.description,
            status: newComplaint.status,
            date: new Date(newComplaint.date).toISOString().split('T')[0],
        };
    } catch (error) {
        console.error('Error submitting complaint:', error);
        throw error;
    }
};
const updateUserInDB = async (userId, updateData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || 'Failed to save profile changes');
        }

        return await response.json(); // Returns the updated user object
    } catch (error) {
        console.error('API Profile Update Error:', error);
        throw error;
    }
};
// --- API FETCH FUNCTIONS (In App.js) ---

const fetchAnnouncements = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/events`);
        if (!response.ok) throw new Error('Failed to fetch announcements');
        const data = await response.json();
        return data.map(e => ({
            id: e._id,
            title: e.title,
            // 🚩 MODIFIED: Capture all new fields
            description: e.description, // Keep description separate
            date: e.date, 
            time: e.time, 
            venue: e.venue, 
            organizer: e.organizer
        })).sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
        console.error('Error fetching announcements:', error);
        return [];
    }
};

const fetchNotifications = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/notifications`);
        if (!response.ok) throw new Error('Failed to fetch notifications');
        const data = await response.json();
        return data.map((n, index) => ({
             id: n._id || index, 
             type: 'general',
             title: n.title, 
             body: n.message, 
             read: false,
             time: `${Math.floor((Date.now() - new Date(n.createdAt).getTime()) / 3600000)}h ago`
        }));
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return INITIAL_NOTIFICATIONS;
    }
};


// --- MAIN APP COMPONENT ---
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // 🚩 CHANGE: Initial page is 'welcome'
  const [page, setPage] = useState('welcome');
  const [history, setHistory] = useState(['welcome']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAlertActive, setIsAlertActive] = useState(false);
  
  
  const [userData, setUserData] = useState(null); 
  const [sportsAvailability, setSportsAvailability] = useState(INITIAL_SPORTS_AVAILABILITY);
  const [messCrowd, setMessCrowd] = useState(INITIAL_MESS_CROWD);
  const [notifications, setNotifications] = useState([]); 
  const [announcements, setAnnouncements] = useState([]); 
  const [sportsEvents, setSportsEvents] = useState([]); 
  const [vmartStock, setVmartStock] = useState([]);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(false);
  
  

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
  
  useEffect(() => {
    if (isLoggedIn && userData) {
        const loadInitialData = async () => {
            setIsLoadingInitialData(true);
            try {
                const fetchedNotifications = await fetchNotifications();
                setNotifications(fetchedNotifications);

                const fetchedAnnouncements = await fetchAnnouncements();
                setAnnouncements(fetchedAnnouncements);
                const fetchedEvents = await fetchSportsEvents();
                setSportsEvents(fetchedEvents); // Set the fetched events state

                const fetchedVmartStock = await fetchVmartStock();
                setVmartStock(fetchedVmartStock);
                
            } catch (error) {
                console.error("Error loading initial data:", error);
            } finally {
                setIsLoadingInitialData(false);
            }
        };
        loadInitialData();
    }
  }, [isLoggedIn, userData]);

  

  // --- API Handlers ---
  const handleAppLogin = async (email, password) => { 
    try {
        const user = await loginUser(email, password); 
        setUserData(user); 
        setIsLoggedIn(true); 
        navigate('dashboard'); 
    } catch (error) {
        alert("Login Failed: " + error.message);
    }
  };

  const handleAppRegistration = async (formData) => {
    try {
        const newUser = await registerUser(formData);
        // Assuming successful registration logs the user in
        setUserData(newUser);
        setIsLoggedIn(true);
        navigate('dashboard');
        alert("Registration Successful!");
    } catch (error) {
        alert("Registration Failed: " + error.message);
    }
  };


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
  const handleLogout = () => { setIsLoggedIn(false); setHistory(['welcome']); setHistoryIndex(0); setPage('welcome'); setIsProfileMenuOpen(false); setIsAlertActive(false); setUserData(null); }; // 🚩 CHANGE: Redirect to 'welcome'

  const addNotification = (newNotification) => {
    setNotifications(prev => [{...newNotification, id: Date.now(), read: false, time: 'Just now'}, ...prev]);
  };

  const contextValue = {
    navigate, isDarkMode, setIsDarkMode, isSidebarOpen, setIsSidebarOpen, user: userData, updateUser: setUserData, handleLogout,
    isProfileMenuOpen, setIsProfileMenuOpen, isAlertActive, setIsAlertActive, sportsAvailability, setSportsAvailability,
    messCrowd, setMessCrowd, notifications, setNotifications, addNotification, isNotificationsOpen, setIsNotificationsOpen,
    announcements,sportsEvents,setSportsEvents,vmartStock,
    handleAppLogin, // Pass login handler
    handleAppRegistration, // Pass registration handler
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className={`min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        {!isLoggedIn ? <PageContent currentPage={page} isAuthPage={true} /> : ( // 🚩 CHANGE: Show PageContent for auth pages
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <Header goBack={goBack} goForward={goForward} canGoBack={historyIndex > 0} canGoForward={historyIndex < history.length - 1} />
              <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gray-100 dark:bg-gray-900">
                {isLoadingInitialData && page === 'dashboard' ? (
                    <div className="flex items-center justify-center h-full min-h-[50vh] text-gray-500 dark:text-gray-400">
                        <Loader className="animate-spin mr-3"/> Loading Dashboard...
                    </div>
                ) : (
                    <PageContent currentPage={page} />
                )}
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

// Helper component for form inputs (DEFINED ONCE, EXTERNALLY)
const FormInput = ({ label, type, value, onChange, required, name, showPassword, setShowPassword }) => (
    <div>
        <label htmlFor={name} className="text-sm font-bold text-gray-600 dark:text-gray-300 block">
            {label}
        </label>
        {name === 'password' ? (
            <div className="relative">
                <input
                    // The input type logic remains standard: if showPassword is true, show text.
                    type={showPassword ? 'text' : 'password'} 
                    id={name}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full p-3 mt-1 text-gray-900 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded-md pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required={required}
                />
                <button
                    type="button" 
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 mt-1 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                    {/* 🚩 FIX: ICON LOGIC INVERTED 🚩
                       If showPassword is TRUE (password is visible), show the EyeOff (closed) icon,
                       representing the action to hide it.
                    */}
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />} 
                </button>
            </div>
        ) : (
            <input
                type={type}
                id={name}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-3 mt-1 text-gray-900 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required={required}
            />
        )}
    </div>
);
// --- PAGE ROUTING ---
const PageContent = ({ currentPage }) => {
  switch (currentPage) {
    // 🚩 CHANGE: Add 'welcome' and route 'login' to the combined auth page
    case 'welcome': return <WelcomePage />;
    case 'login': return <LoginPage mode="login" />;
    case 'register': return <LoginPage mode="register" />;
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

// 🚩 NEW COMPONENT: Welcome Page
const WelcomePage = () => {
    const { navigate } = useContext(AppContext);
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-lg p-10 space-y-10 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl text-center">
                <h1 className="text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">HIVE</h1>
                <p className="text-xl text-gray-600 dark:text-gray-400">Hostel Integrated Virtual Environment</p>
                <div className="flex flex-col space-y-4">
                    <button onClick={() => navigate('login')} className="w-full py-4 text-lg font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-transform transform hover:scale-[1.02]">
                        Login 
                    </button>
                    <button onClick={() => navigate('register')} className="w-full py-4 text-lg font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-transform transform hover:scale-[1.02]">
                        Register 
                    </button>
                </div>
            </div>
        </div>
    );
};

// MODIFIED COMPONENT: LoginPage now handles both Login and Register
const LoginPage = ({ mode }) => {
    const { handleAppLogin, handleAppRegistration, navigate } = useContext(AppContext);
    
    // State definitions
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [regNo, setRegNo] = useState('');
    const [room, setRoom] = useState('');
    const [block, setBlock] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // 🚩 CRITICAL STATE FOR PASSWORD TOGGLE
    const [showPassword, setShowPassword] = useState(false); 

    const isRegister = mode === 'register';

    const handleSubmit = async (e) => { 
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (isRegister) {
                const formData = { name, email, regNo, room, block, password };
                await handleAppRegistration(formData);
            } else {
                await handleAppLogin(email, password);
            }
        } catch (error) {
            // Error handling is inside handleAppLogin/handleAppRegistration
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-transform duration-300">
                <div className="text-center">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">{isRegister ? 'Register' : 'Login'} to HIVE</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        {isRegister ? 'Create your new hostel account' : 'Access your virtual environment'}
                    </p>
                </div>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {isRegister && (
                        <>
                            <FormInput label="Full Name" type="text" value={name} onChange={setName} required={true} name="name" />
                            <FormInput label="Registration No." type="text" value={regNo} onChange={setRegNo} required={true} name="regNo" />
                            <FormInput label="Room No. (e.g., A-303)" type="text" value={room} onChange={setRoom} required={true} name="room" />
                            <FormInput label="Block" type="text" value={block} onChange={setBlock} required={true} name="block" />
                        </>
                    )}
                    <FormInput label="University Email" type="email" value={email} onChange={setEmail} required={true} name="email" />
                    
                    {/* CRITICAL CALL: Pass the password state and setter */}
                    <FormInput 
                        label="Password" 
                        type="password" 
                        value={password} 
                        onChange={setPassword} 
                        required={true} 
                        name="password" 
                        showPassword={showPassword}        
                        setShowPassword={setShowPassword}  
                    />
                    
                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-transform duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                            {isSubmitting ? <Loader className="animate-spin h-5 w-5" /> : (isRegister ? 'Register' : 'Login')}
                        </button>
                    </div>
                </form>
                <div className="text-center text-sm">
                    <button onClick={() => navigate(isRegister ? 'login' : 'register')} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                        {isRegister ? 'Already have an account? Login' : 'Need an account? Register here'}
                    </button>
                    <button onClick={() => navigate('welcome')} className="block mt-2 text-gray-500 dark:text-gray-500 hover:underline">
                        Back to Welcome
                    </button>
                </div>
            </div>
        </div>
    );


   // Helper component for form inputs (DEFINED ONCE, OUTSIDE)
 const FormInput = ({ label, type, value, onChange, required, name, showPassword, setShowPassword }) => (
    <div>
        <label htmlFor={name} className="text-sm font-bold text-gray-600 dark:text-gray-300 block">
            {label}
        </label>
        {name === 'password' ? (
            <div className="relative">
                <input
                    type={showPassword ? 'text' : 'password'} 
                    id={name}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full p-3 mt-1 text-gray-900 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded-md pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required={required}
                />
                <button
                    type="button" 
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 mt-1 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
        ) : (
            <input
                type={type}
                id={name}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-3 mt-1 text-gray-900 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required={required}
            />
        )}
    </div>
);
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-transform duration-300">
                <div className="text-center">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">{isRegister ? 'Register' : 'Login'} to HIVE</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        {isRegister ? 'Create your new hostel account' : 'Access your virtual environment'}
                    </p>
                </div>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {isRegister && (
                        <>
                            <FormInput label="Full Name" type="text" value={name} onChange={setName} required={true} name="name" />
                            <FormInput label="Registration No." type="text" value={regNo} onChange={setRegNo} required={true} name="regNo" />
                            <FormInput label="Room No. (e.g., A-303)" type="text" value={room} onChange={setRoom} required={true} name="room" />
                            <FormInput label="Block" type="text" value={block} onChange={setBlock} required={true} name="block" />
                        </>
                    )}
                    <FormInput label="University Email" type="email" value={email} onChange={setEmail} required={true} name="email" />
                    
                    {/* 🚩 Usage of the new FormInput logic for password */}
                    <FormInput label="Password" type="password" value={password} onChange={setPassword} required={true} name="password" showPassword={showPassword} setShowPassword={setShowPassword} />
                    
                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-transform duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                            {isSubmitting ? <Loader className="animate-spin h-5 w-5" /> : (isRegister ? 'Register' : 'Login')}
                        </button>
                    </div>
                </form>
                <div className="text-center text-sm">
                    <button onClick={() => navigate(isRegister ? 'login' : 'register')} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                        {isRegister ? 'Already have an account? Login' : 'Need an account? Register here'}
                    </button>
                    <button onClick={() => navigate('welcome')} className="block mt-2 text-gray-500 dark:text-gray-500 hover:underline">
                        Back to Welcome
                    </button>
                </div>
            </div>
        </div>
    );
};


const DashboardPage = () => {
    const { navigate, user, isAlertActive } = useContext(AppContext);
    
    const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

    if (!user) return <div className="text-center p-10"><Loader className="animate-spin mx-auto"/> Loading User Data...</div>;

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
const ProfileField = ({ label, value, name, isEditing, handleInputChange }) => (
    <div>
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
        {isEditing ? (
            // Note: The handleInputChange prop must be passed correctly
            <input type="text" name={name} value={value || ''} onChange={handleInputChange} className="mt-1 w-full p-2 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        ) : ( <dd className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{value}</dd> )}
    </div>
);

const ProfilePage = () => {
    const { user, updateUser } = useContext(AppContext);
    
    // ... existing hooks ...
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState(user);
    const [isSaving, setIsSaving] = useState(false); // New state for loading indicator

    useEffect(() => { 
        setFormData(user); 
    }, [user]);

    if (!user) return <div className="text-center p-10"><Loader className="animate-spin mx-auto"/> Loading Profile...</div>;

    const handleInputChange = (e) => { setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })); };
    
    // 🚩 MODIFIED: Asynchronous handleSave function
    const handleSave = async () => { 
        setIsSaving(true);
        try {
            // Get only the fields allowed for update
            const updatePayload = {
                name: formData.name,
                regNo: formData.regNo,
                room: formData.room,
                block: formData.block,
            };

            const updatedUser = await updateUserInDB(user._id, updatePayload);
            
            // Update the global user context with the data returned from the server
            updateUser(updatedUser); 
            setIsEditMode(false);
            alert("Profile saved successfully!");

        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };
    const handleCancel = () => { setFormData(user); setIsEditMode(false); };

    
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
                            <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} className="text-3xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-indigo-500 focus:outline-none w-full" />
                        ) : ( <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{formData.name}</h2> )}
                        <p className="text-indigo-500 dark:text-indigo-400 text-lg">{formData.email}</p>
                    </div>
                </div>
                <div className="mt-10 border-t border-gray-200 dark:border-gray-700 pt-8">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                    {/* 🚩 UPDATED CALLS: Pass handleInputChange as a prop */}
                    <ProfileField 
                        label="Registration No." 
                        value={formData.regNo} 
                        name="regNo" 
                        isEditing={isEditMode}
                        handleInputChange={handleInputChange} // <-- Pass handler
                    />
                    <ProfileField 
                        label="Block" 
                        value={formData.block} 
                        name="block" 
                        isEditing={isEditMode} 
                        handleInputChange={handleInputChange} // <-- Pass handler
                    />
                    <ProfileField 
                        label="Room No." 
                        value={formData.room} 
                        name="room" 
                        isEditing={isEditMode} 
                        handleInputChange={handleInputChange} // <-- Pass handler
                    />
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
// --- ComplaintPage (in App.js) ---

const ComplaintPage = () => {
    const { user } = useContext(AppContext);
    const [complaints, setComplaints] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadComplaints = async () => {
            if (!user || !user._id) {
                setIsLoading(false);
                console.error("User not fully loaded, skipping complaint fetch.");
                return;
            }
            setIsLoading(true);
            const fetchedComplaints = await fetchComplaints(user._id); 
            setComplaints(fetchedComplaints);
            setIsLoading(false);
        };
        loadComplaints();
    }, [user]); 

    const getStatusColor = (status) => {
        switch (status) {
            case 'Resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            case 'In Progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
            case 'Pending': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };
    
    const handleNewComplaint = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const newComplaintData = {
            category: e.target.category.value,
            description: e.target.description.value,
            userId: user._id, 
        };
        
        try {
            const submittedComplaint = await submitComplaint(newComplaintData); 
            setComplaints([submittedComplaint, ...complaints]);
            setShowForm(false);
            e.target.reset();
            alert('Complaint submitted successfully!');
        } catch (error) {
            alert('Failed to submit complaint. See console for details.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* 🚩 FIX: Ensure the header and the button are present */}
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
                        {/* The image upload fields are correctly omitted here */}
                        
                        <div className="text-right">
                            <button type="submit" disabled={isSubmitting} className="px-6 py-3 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 disabled:opacity-50">
                                {isSubmitting ? <Loader className="animate-spin h-5 w-5 mx-auto"/> : 'Submit Complaint'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                {isLoading ? (
                    <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                        <Loader className="animate-spin h-6 w-6 mx-auto mb-2"/> Loading complaints...
                    </div>
                ) : complaints.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">No complaints found for your user ID.</p>
                ) : (
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
                )}
            </div>
        </div>
    );
};
const trackLaundryByToken = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/laundry/track/${token}`);

        if (response.status === 404) {
             return { status: 'Not Found', details: 'No laundry found with this token number.' };
        }
        if (!response.ok) {
            throw new Error('Server error during tracking.');
        }

        return await response.json();
    } catch (error) {
        console.error('Error tracking laundry:', error);
        return { status: 'Error', details: 'Could not connect to service.' };
    }
};
const submitLaundryBooking = async (bookingData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/laundry`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || 'Booking failed.');
        }

        return await response.json();
    } catch (error) {
        console.error('API Laundry Booking Error:', error);
        throw error;
    }
};

const LaundryPage = () => {
    const { user } = useContext(AppContext);
    // State to store the *saved* booking details from DB
    const [bookedSlotDetails, setBookedSlotDetails] = useState(null); 
    
    const [laundryTokenInput, setLaundryTokenInput] = useState('');
    const [laundryStatus, setLaundryStatus] = useState(null);
    const [isLoadingStatus, setIsLoadingStatus] = useState(false);

    // Helper to generate a unique token
    const generateToken = () => `TKN${Math.floor(1000 + Math.random() * 9000)}`;

    const handleBooking = async (slot) => {
        if (!user || !user._id) {
            alert("Please log in to book a slot.");
            return;
        }

        const token = generateToken();
        const bookingData = {
            userId: user._id,
            tokenNumber: token,
            slotTime: slot,
            status: 'Pending',
        };

        try {
            const savedBooking = await submitLaundryBooking(bookingData);
            
            setBookedSlotDetails({
                token: savedBooking.tokenNumber,
                slot: savedBooking.slotTime,
                date: new Date(savedBooking.date).toLocaleDateString(),
            });

            alert(`Booking confirmed! Token: ${savedBooking.tokenNumber}`);
        } catch (error) {
            // 🚩 MODIFIED ALERT to display the specific error message from the backend
            alert(`Booking Failed: ${error.message}`); 
        }
    };

    const handleTrackLaundry = async (e) => {
        e.preventDefault();
        
        if (!laundryTokenInput) return;
        
        setIsLoadingStatus(true);
        setLaundryStatus(null);
        
        try {
            const statusData = await trackLaundryByToken(laundryTokenInput);
            setLaundryStatus(statusData);
        } catch (error) {
            setLaundryStatus({ status: 'Error', details: 'Failed to reach tracking service.' });
        } finally {
            setIsLoadingStatus(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Laundry Services</h1>
            
            {/* --- Track Your Laundry Section --- */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Track Your Laundry</h2>
                <form onSubmit={handleTrackLaundry} className="flex items-center space-x-3">
                    <input type="text" value={laundryTokenInput} onChange={(e) => setLaundryTokenInput(e.target.value)} placeholder="Enter Token Number (e.g., TKN101)" className="w-full p-3 bg-gray-100 dark:bg-gray-700 border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <button type="submit" className="px-6 py-3 font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700" disabled={isLoadingStatus}>
                        {isLoadingStatus ? <Loader className="animate-spin" size={20} /> : 'Track'}
                    </button>
                </form>
                {laundryStatus && (
                    <div className={`mt-6 p-4 rounded-lg ${
                        laundryStatus.status === 'Ready for Pickup' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 
                        laundryStatus.status === 'Pending' || laundryStatus.status === 'In Progress' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' :
                        'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                    }`}>
                        <p className="font-bold">Status: {laundryStatus.status}</p>
                        <p>{laundryStatus.details}</p>
                    </div>
                )}
            </div>

            {/* --- Book a Laundry Slot Section --- */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Book a Laundry Slot</h2>
                {bookedSlotDetails ? (
                    <div className="bg-green-100 dark:bg-green-900/50 border-l-4 border-green-500 text-green-700 dark:text-green-300 p-6 rounded-2xl text-center">
                        <h3 className="text-2xl font-bold">Booking Confirmed!</h3>
                        <p className="mt-2 text-lg">Your slot is booked for <span className="font-bold">{bookedSlotDetails.slot}</span> on {bookedSlotDetails.date}.</p>
                        <p className="mt-4 text-xl font-bold">Your Token Number is:</p>
                        <p className="text-4xl font-mono font-extrabold tracking-widest mt-2">{bookedSlotDetails.token}</p>
                        <button onClick={() => setBookedSlotDetails(null)} className="mt-6 px-6 py-2 font-bold text-white bg-red-600 rounded-lg hover:bg-red-700">Clear Details</button>
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
    const { messCrowd, setMessCrowd, user } = useContext(AppContext);
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
            const newCrowd = { ...prev };
            
            // Identify the ID of the other mess
            const otherMessId = messId === 'ras_sense' ? 'fusion' : 'ras_sense';

            // 🚩 FIX: Check out of the *other* mess if the user is currently checked in there
            if (newCrowd[otherMessId].userCheckedIn) {
                newCrowd[otherMessId] = { 
                    ...newCrowd[otherMessId], 
                    current: Math.max(0, newCrowd[otherMessId].current - 1), 
                    userCheckedIn: false 
                };
                console.log(`Checked user out of ${newCrowd[otherMessId].name}.`);
            }

            // Check the user into the selected mess
            // This condition is important: only increment if they weren't already checked into this one.
            if (!newCrowd[messId].userCheckedIn) {
                newCrowd[messId] = { 
                    ...newCrowd[messId], 
                    current: newCrowd[messId].current + 1, 
                    userCheckedIn: true 
                };
                console.log(`Checked user into ${newCrowd[messId].name}.`);
            }

            return newCrowd;
        });
    };

    const handleCheckOut = (messId) => {
        setMessCrowd(prev => ({
            ...prev,
            [messId]: { ...prev[messId], current: Math.max(0, prev[messId].current - 1), userCheckedIn: false }
        }));
    };

    const handleFeedbackSubmit = async (e) => { // 🚩 Made async
        e.preventDefault();
        
        if (rating === 0) {
            alert("Please provide a star rating.");
            return;
        }
        

        if (!user || !user._id) {
             alert("User data missing. Cannot submit feedback.");
             return;
        }
        
        const comments = e.target.comments.value;

        const feedbackPayload = {
            userId: user._id,
            mealType: 'Feedback', // Match the type used in the backend
            rating: rating,
            feedback: comments // Text comment
        };

        try {
            // 🚩 NEW API CALL: Submit the structured feedback
            const response = await fetch(`${API_BASE_URL}/mess`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(feedbackPayload),
            });
            
            if (!response.ok) {
                throw new Error("Server rejected feedback submission.");
            }

            setFeedbackSubmitted(true);
            setRating(0); // Reset rating
            e.target.comments.value = ''; // Clear comments

            setTimeout(() => setFeedbackSubmitted(false), 3000);
        } catch (error) {
            alert(`Failed to submit feedback: ${error.message}`);
        }
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
    // Destructure the setter for sportsEvents
    const { sportsAvailability, setSportsAvailability, sportsEvents, user, setSportsEvents } = useContext(AppContext);
    
    // Helper to determine if the current user is registered for an event
    const isUserRegistered = (event) => {
        if (!user || !user._id) return false;
        // Check if the user ID exists in the registeredUsers array (by matching _id)
        return event.registeredUsers.some(regUser => regUser._id === user._id);
    };

    // UNIFIED FUNCTION: Handles event registration via API
    const handleEventRegistration = async (eventToRegister) => {
        if (!user || !user._id) {
            alert("Please log in to register for an event.");
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/sports`, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: eventToRegister.id,
                    userId: user._id
                }),
            });
            
            if (!response.ok) {
                 const errorData = await response.json();
                 if (response.status === 409) {
                     throw new Error(errorData.msg);
                 }
                 throw new Error(errorData.msg || "Failed to register for event.");
            }
            
            // Get the fully updated event data from the server response
            const updatedEvent = await response.json();
            
            // FIX: Update the local state (sportsEvents) immutably to show the new count instantly
            setSportsEvents(prevEvents => prevEvents.map(event => 
                event.id === eventToRegister.id ? updatedEvent : event
            ));

            alert(`Successfully registered for ${updatedEvent.game}!`);
            
        } catch (error) {
            alert(`Registration Error: ${error.message}`);
        }
    };

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
                    {sportsEvents.length === 0 ? (
                         <p className="text-center text-gray-500 dark:text-gray-400 py-8">No current events available.</p>
                    ) : (
                        sportsEvents.map(sport => (
                            <div key={sport.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center transition-all duration-300 hover:shadow-xl hover:scale-105">
                                <div className="mb-4 sm:mb-0">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{sport.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {sport.date} at {sport.time} | Venue: {sport.venue}
                                    </p>
                                    {/* 🚩 NEW: Display Registered Users List */}
                                    {sport.registeredUsers.length > 0 && (
                                        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Participants:</p>
                                            <ul className="text-xs space-y-0.5">
                                                {sport.registeredUsers.map((u, index) => (
                                                    <li key={index} className="text-gray-600 dark:text-gray-400">
                                                        - {u.name} ({u.regNo})
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                {isUserRegistered(sport) ? (
                                    <span className="px-4 py-2 text-sm font-semibold text-green-800 bg-green-200 dark:text-green-200 dark:bg-green-800/50 rounded-full flex items-center space-x-2"><CheckCircle size={16}/><span>Registered</span></span>
                                ) : (
                                    <button onClick={() => handleEventRegistration(sport)} className="px-5 py-2.5 font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Register</button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
// --- API FETCH FUNCTIONS (In App.js) ---

// 🚩 NEW FUNCTION: Fetch sports events with populated user data
const fetchSportsEvents = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/sports`);
        if (!response.ok) throw new Error('Failed to fetch sports events');
        
        const data = await response.json();
        
        // Map the data to a cleaner format, similar to the mock structure
        return data.map(e => ({
            id: e._id,
            name: e.game,
            date: e.date,
            time: e.time,
            venue: e.venue,
            // Keep the populated array of user objects
            registeredUsers: e.registeredUsers || [], 
            registered: false, // This will be set by the component logic
        })).sort((a, b) => new Date(b.date) - new Date(a.date));

    } catch (error) {
        console.error('Error fetching sports events:', error);
        return [];
    }
};
const VMartPage = () => {
    // MODIFIED: Get vmartStock from context
    const { vmartStock, addNotification } = useContext(AppContext);
    
    // 🚩 FIX: Define the state variables for the accordion logic (openCategory and setOpenCategory)
    // Initialize state to the first category if stock is available
    const [openCategory, setOpenCategory] = useState(vmartStock.length > 0 ? vmartStock[0].category : null);
    
    // Update openCategory whenever vmartStock changes, if it was null
    useEffect(() => {
        if (openCategory === null && vmartStock.length > 0) {
            setOpenCategory(vmartStock[0].category);
        }
    }, [vmartStock, openCategory]);

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
                {vmartStock.length === 0 ? (
                    <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                        <Loader className="animate-spin h-6 w-6 mx-auto mb-2"/> Loading V-Mart Stock...
                    </div>
                ) : (
                    vmartStock.map(category => (
                        <div key={category.category} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                            {/* 🚩 Usage of setOpenCategory and openCategory are now valid */}
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
                    ))
                )}
            </div>
        </div>
    );
};
const AnnouncementsPage = () => {
    const { announcements } = useContext(AppContext);
    
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Announcements & Events</h1>
            <div className="space-y-6">
                {announcements.length === 0 ? (
                     <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                        <Loader className="animate-spin h-6 w-6 mx-auto mb-2"/> Loading announcements...
                    </div>
                ) : (
                    announcements.map(ann => (
                        <div key={ann.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{ann.title}</h2>
                            
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                Posted on: **{ann.date}**
                            </p>
                            
                            {/* 🚩 NEW: Display Description */}
                            <p className="text-gray-700 dark:text-gray-300 mb-4">{ann.description}</p>

                            {/* 🚩 NEW: Display Time, Venue, and Organizer */}
                            <div className="grid grid-cols-2 gap-y-2 text-sm">
                                <p className="text-gray-600 dark:text-gray-400">
                                    <span className="font-semibold text-gray-800 dark:text-white">Time:</span> {ann.time}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">
                                    <span className="font-semibold text-gray-800 dark:text-white">Venue:</span> {ann.venue}
                                </p>
                                <p className="col-span-2 text-gray-600 dark:text-gray-400">
                                    <span className="font-semibold text-gray-800 dark:text-white">Organizer:</span> {ann.organizer}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// 🚩 NEW FUNCTION: Fetch grouped Vmart stock data
const fetchVmartStock = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/vmart`);
        if (!response.ok) throw new Error('Failed to fetch Vmart stock');
        return await response.json();
    } catch (error) {
        console.error('Error fetching V-Mart stock:', error);
        return []; // Return an empty array on failure
    }
};

const EmergencyModal = ({ isOpen, onClose }) => {
    const { setIsAlertActive, user } = useContext(AppContext);
    const [confirmed, setConfirmed] = useState(false);
    const [alertSent, setAlertSent] = useState(false);

    const handleConfirm = async () => {
        if (!user || !user._id) {
            alert("Error: User information is missing. Cannot send alert.");
            return;
        }

        setConfirmed(true);

        try {
            // 🚩 NEW API CALL TO THE BACKEND
            const response = await fetch(`${API_BASE_URL}/emergencies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id }), // Send only the user ID
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Server failed to record alert.');
            }

            // Success animation/state change
            setAlertSent(true);
            setIsAlertActive(true); // Activate the dashboard banner

            setTimeout(() => {
                setIsAlertActive(false); // Deactivate the alert banner
                console.log("Emergency alert banner deactivated after 10 seconds.");
            }, 10000);
            
            // Auto-close modal after confirmation
            setTimeout(() => {
                onClose();
                setConfirmed(false);
                setAlertSent(false);
            }, 2000);

        } catch (error) {
            alert(`Emergency Alert Failed: ${error.message}`);
            setConfirmed(false); // Allow retrying
        }
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