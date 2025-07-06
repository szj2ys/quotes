import React from 'react';

interface GlassBoxProps {
    children: React.ReactNode;
    className?: string;
}

const GlassBox: React.FC<GlassBoxProps> = ({ children, className = '' }) => {
    return (
        <div className={`
      relative 
      backdrop-blur-sm 
      bg-black/5 
      border 
      border-white/10 
      rounded-3xl 
      shadow-lg
      shadow-black/10
      p-8 
      md:p-12 
      lg:p-16
      overflow-hidden
      before:absolute 
      before:inset-0 
      before:bg-gradient-to-br 
      before:from-white/10 
      before:via-transparent 
      before:to-transparent 
      before:rounded-3xl
      before:pointer-events-none
      ${className}
    `}>
            {/* 内部发光效果 - 更淡 */}
            <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-white/2 to-transparent pointer-events-none" />

            {/* 内容容器 - 确保不超出边界 */}
            <div className="relative z-10 overflow-hidden">
                {children}
            </div>
        </div>
    );
};

export default GlassBox;
