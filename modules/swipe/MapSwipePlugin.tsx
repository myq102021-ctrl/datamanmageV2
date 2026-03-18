
import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, GripVertical, Layers, ArrowLeftRight } from 'lucide-react';

interface MapSwipePluginProps {
    visibleLayers: string[];
    onClose: () => void;
    zoom: number;
}

/**
 * 地图卷帘插件 (Independent Plugin)
 * 强命名空间隔离：.v2-map-swipe-*
 */
export const MapSwipePlugin: React.FC<MapSwipePluginProps> = ({ visibleLayers, onClose, zoom }) => {
    const [sliderPos, setSliderPos] = useState(50); // 0-100
    const [leftLayer, setLeftLayer] = useState<string>(visibleLayers[0] || '默认底图');
    const [rightLayer, setRightLayer] = useState<string>(visibleLayers[1] || visibleLayers[0] || '基础地理要素');
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        setSliderPos((x / rect.width) * 100);
    };

    const handleMouseUp = () => setIsDragging(false);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    return (
        <div 
            ref={containerRef}
            className="v2-map-swipe-plugin absolute inset-0 z-[150] bg-slate-900 select-none overflow-hidden animate-fadeIn"
        >
            {/* 1. 背景层：右侧/基准图层 */}
            <div className="absolute inset-0 bg-[#dcdfe4]">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/BlankMap-World.svg/2560px-BlankMap-World.svg.png" 
                        style={{ transform: `scale(${1 + (zoom - 5) * 0.1})` }}
                        className="w-full h-full object-cover opacity-60 grayscale brightness-110 mix-blend-multiply" 
                        alt=""
                    />
                    <div className="absolute inset-0 bg-blue-500/5"></div>
                </div>
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white text-[10px] font-black uppercase tracking-widest z-10">
                    RIGHT: {rightLayer}
                </div>
            </div>

            {/* 2. 对比层：左侧图层 (使用 clip-path 裁剪) */}
            <div 
                className="absolute inset-0 bg-[#c0c4cc] border-r-2 border-blue-500/20 shadow-2xl"
                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/BlankMap-World.svg/2560px-BlankMap-World.svg.png" 
                        style={{ transform: `scale(${1 + (zoom - 5) * 0.1})` }}
                        className="w-full h-full object-cover opacity-80 mix-blend-screen" 
                        alt=""
                    />
                    <div className="absolute inset-0 bg-emerald-500/10"></div>
                </div>
                <div className="absolute top-4 left-4 bg-blue-600/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white text-[10px] font-black uppercase tracking-widest z-10 shadow-lg">
                    LEFT: {leftLayer}
                </div>
            </div>

            {/* 3. 滑动控制柄 */}
            <div 
                className="v2-map-swipe-handle absolute top-0 bottom-0 w-1 bg-blue-500 z-20 cursor-col-resize group shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                style={{ left: `${sliderPos}%` }}
                onMouseDown={() => setIsDragging(true)}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 rounded-full border-4 border-white shadow-2xl flex items-center justify-center text-white transition-transform group-hover:scale-110 active:scale-95 ring-4 ring-blue-500/20">
                    <GripVertical size={18} />
                </div>
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>

            {/* 4. 底部图层快速选择器 */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 animate-slideUp">
                <div className="bg-white/90 backdrop-blur-xl border border-slate-200 p-1.5 rounded-2xl shadow-2xl flex items-center gap-3 ring-1 ring-slate-900/5">
                    <SwipeSelector 
                        label="左侧图层" 
                        value={leftLayer} 
                        options={visibleLayers} 
                        onSelect={setLeftLayer} 
                        color="text-blue-600"
                    />
                    <div className="p-2 text-slate-300">
                        <ArrowLeftRight size={14} />
                    </div>
                    <SwipeSelector 
                        label="右侧图层" 
                        value={rightLayer} 
                        options={visibleLayers} 
                        onSelect={setRightLayer} 
                        color="text-emerald-600"
                    />
                </div>

                <button 
                    onClick={onClose}
                    className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-2xl text-xs font-black shadow-xl shadow-rose-900/20 hover:bg-rose-700 transition-all active:scale-95"
                >
                    退出卷帘模式 <X size={16} />
                </button>
            </div>

            {/* 水印 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] select-none text-[60px] font-black text-white whitespace-nowrap -rotate-12">
                SWIPE COMPARISON MODE
            </div>
        </div>
    );
};

const SwipeSelector: React.FC<{ label: string; value: string; options: string[]; onSelect: (v: string) => void; color: string }> = ({ label, value, options, onSelect, color }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative">
            <div 
                onClick={() => setOpen(!open)}
                className="flex flex-col px-4 py-1.5 hover:bg-slate-50 rounded-xl transition-all cursor-pointer min-w-[140px]"
            >
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                <div className="flex items-center justify-between gap-2">
                    <span className={`text-[12px] font-bold truncate ${color}`}>{value}</span>
                    <ChevronDown size={14} className="text-slate-300" />
                </div>
            </div>
            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}></div>
                    <div className="absolute bottom-full mb-3 left-0 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 p-2 z-50 animate-fadeIn">
                        <div className="p-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1 flex items-center gap-1.5">
                            <Layers size={12} /> 可视对比图层
                        </div>
                        <div className="max-h-48 overflow-y-auto custom-scrollbar">
                            {options.map(opt => (
                                <div 
                                    key={opt}
                                    onClick={() => { onSelect(opt); setOpen(false); }}
                                    className={`px-3 py-2 text-[12px] font-bold rounded-lg cursor-pointer transition-all ${value === opt ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {opt}
                                </div>
                            ))}
                            {options.length === 0 && <div className="p-4 text-xs text-slate-400 italic">请先在图层面板勾选图层</div>}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
