import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import Button from './ui/Button';
import { Clock, LogIn, LogOut, Loader2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn';

const AttendancePunch = () => {
    const [status, setStatus] = useState(null); // 'in', 'out', or null
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [location, setLocation] = useState(null);

    useEffect(() => {
        fetchStatus();
        preFetchLocation();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const preFetchLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocation(`${pos.coords.latitude}, ${pos.coords.longitude}`),
                (err) => console.debug("Pre-fetch location failed", err),
                { enableHighAccuracy: true, timeout: 5000 }
            );
        }
    };

    const fetchStatus = async () => {
        try {
            const res = await axios.get('/hr/attendance/today');
            const data = res.data.data;
            if (data) {
                if (data.check_out) {
                    setStatus('out');
                } else if (data.check_in) {
                    setStatus('in');
                }
            }
        } catch (err) {
            console.error('Failed to fetch attendance status', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePunch = async () => {
        setActionLoading(true);
        // Generate IST timestamp string with explicit offset (YYYY-MM-DDTHH:mm:ss+05:30)
        const format = (d) => {
            const z = (n) => ('0' + n).slice(-2);
            const istDate = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
            return `${istDate.getFullYear()}-${z(istDate.getMonth() + 1)}-${z(istDate.getDate())}T${z(istDate.getHours())}:${z(istDate.getMinutes())}:${z(istDate.getSeconds())}+05:30`;
        };
        const now = format(new Date());
        const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());

        try {
            if (!status) {
                // Use pre-fetched location or try one last time with short timeout
                let locationString = location || 'Location unavailable';
                if (!location) {
                    try {
                        const pos = await new Promise((resolve, reject) => {
                            navigator.geolocation.getCurrentPosition(resolve, reject, { 
                                enableHighAccuracy: true, 
                                timeout: 3000 // 3s max wait for punch
                            });
                        });
                        locationString = `${pos.coords.latitude}, ${pos.coords.longitude}`;
                    } catch (geoErr) {
                        console.warn('Geolocation failed at punch time', geoErr);
                    }
                }

                // Punch In
                await axios.post('/hr/attendance/check-in', {
                    date,
                    check_in: now,
                    status: 'Present',
                    location: locationString
                });
                setStatus('in');
                toast.success('Punched in successfully');
            } else if (status === 'in') {
                // Punch Out
                await axios.post('/hr/attendance/check-out', {
                    date,
                    check_out: now
                });
                setStatus('out');
                toast.success('Punched out successfully');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to process punch');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return null;

    return (
        <div className="space-y-4">
            <div className="text-center">
                <p className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                    {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })}
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    {currentTime.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' })}
                </p>
            </div>

            <div className="flex flex-col gap-2">
                <Button
                    onClick={handlePunch}
                    disabled={actionLoading || status === 'out'}
                    className={cn(
                        "h-10 text-[10px] font-bold uppercase tracking-widest",
                        status === 'in' ? "bg-rose-500 hover:bg-rose-600" : "bg-primary-600 hover:bg-primary-700"
                    )}
                >
                    {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : status === 'in' ? (
                        <><LogOut className="w-4 h-4 mr-2" /> Punch Out</>
                    ) : status === 'out' ? (
                        <><Clock className="w-4 h-4 mr-2" /> Logged</>
                    ) : (
                        <><LogIn className="w-4 h-4 mr-2" /> Punch In</>
                    )}
                </Button>
                
                <div className="flex items-center justify-center gap-1.5 text-[8px] font-bold text-slate-300 uppercase">
                    <MapPin className="w-2.5 h-2.5" />
                    <span>Geo-Logged</span>
                </div>
            </div>
        </div>
    );
};

export default AttendancePunch;
