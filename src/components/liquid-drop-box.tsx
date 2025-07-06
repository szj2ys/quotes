import React from 'react';

interface LiquidDropProps {
    children: React.ReactNode;
    className?: string;
    intensity?: 'subtle' | 'medium' | 'strong';
}

const LiquidDrop: React.FC<LiquidDropProps> = ({
                                                   children,
                                                   className = '',
                                                   intensity = 'medium'
                                               }) => {
    const intensityConfig = {
        subtle: {
            blur: 'backdrop-blur-sm',
            duration: '32s',
            shadow: 'shadow-lg shadow-blue-200/30',
            bgOpacity: 'bg-white/10'
        },
        medium: {
            blur: 'backdrop-blur-md',
            duration: '18s',
            shadow: 'shadow-xl shadow-blue-300/40',
            bgOpacity: 'bg-white/15'
        },
        strong: {
            blur: 'backdrop-blur-lg',
            duration: '16s',
            shadow: 'shadow-2xl shadow-blue-400/50',
            bgOpacity: 'bg-white/20'
        }
    };

    const parseDuration = (duration: string): number => {
        return parseFloat(duration.replace('s', ''));
    };

    const config = intensityConfig[intensity];

    return (
        <div className={`
            relative 
            ${config.blur}
            ${config.bgOpacity}
            border 
            border-white/30 
            ${config.shadow}
            p-6 
            md:p-8 
            lg:p-10
            overflow-visible
            ${className}
        `}
             style={{
                 borderRadius: '25px',
                 animation: `liquidFlow ${parseDuration(config.duration)} ease-in-out infinite`
             }}>

            {/* 主要液体形状 - 放在背景层 */}
            <div
                className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-400/20 via-transparent to-cyan-400/15"
                style={{
                    borderRadius: '25px',
                    animation: `morphShape ${parseDuration(config.duration)} ease-in-out infinite`
                }}
            />

            {/* 柔和的内部光晕 - 不影响内容 */}
            <div
                className="absolute inset-2 -z-10 opacity-60"
                style={{
                    background: `
                        radial-gradient(circle at 30% 20%, rgba(255,255,255,0.3) 0%, transparent 50%),
                        radial-gradient(circle at 70% 80%, rgba(100,200,255,0.2) 0%, transparent 60%)
                    `,
                    borderRadius: '20px',
                    filter: 'blur(2px)',
                    animation: `innerGlow ${parseDuration(config.duration) * 1.5}s ease-in-out infinite alternate`
                }}
            />

            {/* 顶部高光 - 细节效果 */}
            <div
                className="absolute top-3 left-6 w-16 h-8 bg-white/20 -z-10"
                style={{
                    borderRadius: '50px',
                    filter: 'blur(6px)',
                    animation: `topHighlight ${parseDuration(config.duration)}s ease-in-out infinite`
                }}
            />

            {/* 边缘微光 */}
            <div
                className="absolute inset-[-1px] bg-gradient-to-r from-blue-300/20 via-transparent to-cyan-300/20 -z-20 rounded-[26px]"
                style={{
                    filter: 'blur(1px)',
                    animation: `edgeGlow ${parseDuration(config.duration) * 2}s ease-in-out infinite`
                }}
            />

            {/* 内容区域 - 确保在最前面 */}
            <div className="relative z-20">
                {children}
            </div>

            <style jsx>{`
                @keyframes liquidFlow {
                    0%, 100% {
                        border-radius: 25px 30px 25px 30px;
                        transform: scale(1);
                    }
                    33% {
                        border-radius: 30px 25px 35px 20px;
                        transform: scale(1.01);
                    }
                    66% {
                        border-radius: 20px 35px 25px 30px;
                        transform: scale(0.99);
                    }
                }

                @keyframes morphShape {
                    0%, 100% {
                        border-radius: 25px 30px 25px 30px;
                    }
                    25% {
                        border-radius: 35px 20px 30px 25px;
                    }
                    50% {
                        border-radius: 20px 30px 35px 25px;
                    }
                    75% {
                        border-radius: 30px 25px 20px 35px;
                    }
                }

                @keyframes innerGlow {
                    0% {
                        opacity: 0.4;
                        transform: scale(1);
                    }
                    100% {
                        opacity: 0.7;
                        transform: scale(1.02);
                    }
                }

                @keyframes topHighlight {
                    0%, 100% {
                        opacity: 0.2;
                        transform: translateX(0px) translateY(0px) scale(1);
                    }
                    50% {
                        opacity: 0.4;
                        transform: translateX(3px) translateY(-2px) scale(1.1);
                    }
                }

                @keyframes edgeGlow {
                    0%, 100% {
                        opacity: 0.3;
                    }
                    50% {
                        opacity: 0.6;
                    }
                }
            `}</style>
        </div>
    );
};

export default LiquidDrop;
