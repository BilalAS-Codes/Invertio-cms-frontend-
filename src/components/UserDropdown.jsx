import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, Shield, ChevronDown } from 'lucide-react';
import { cn } from '../utils/cn';

const UserDropdown = ({ user, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const menuItems = [
        { label: 'View Profile', icon: User, path: '/profile', color: 'text-slate-600' },
        { label: 'Account Settings', icon: Settings, path: '/settings', color: 'text-slate-600' },
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
            >
                <div className="h-9 w-9 rounded-lg bg-primary-600 text-white flex items-center justify-center font-black shadow-lg shadow-primary-200">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="flex flex-col items-start hidden sm:flex">
                    <span className="text-sm font-bold text-slate-800 leading-tight">{user?.name || 'Admin'}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user?.role_name || 'Staff'}</span>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 bg-slate-50/50 border-b border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Signed in as</p>
                        <p className="text-sm font-bold text-slate-900 truncate">{user?.email}</p>
                    </div>
                    <div className="p-2">
                        {menuItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => {
                                    navigate(item.path);
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-600 hover:text-primary-600 hover:bg-primary-50/50 rounded-xl transition-all group"
                            >
                                <item.icon className="w-4 h-4 text-slate-400 group-hover:text-primary-600 transition-colors" />
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <div className="p-2 border-t border-slate-50">
                        <button
                            onClick={() => {
                                onLogout();
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all group"
                        >
                            <LogOut className="w-4 h-4 text-rose-400 group-hover:text-rose-600 transition-colors" />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDropdown;
