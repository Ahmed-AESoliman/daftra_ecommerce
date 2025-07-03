const GlowingRingsLoader = ({ className }) => {
    return (
        <div className={`glow-loader-container min-h-[12px] ${className || ''} `}>
            {className && <div className="glow-ring ring4 aspect-square h-[90%]"></div>}
            {className && <div className="glow-ring ring4 aspect-square h-[90%]"></div>}
            {className && <div className="glow-ring ring2 aspect-square h-[75%]"></div>}
            {className && <div className="glow-ring ring1 aspect-square h-[65%]"></div>}
        </div>
    );
};

export default GlowingRingsLoader;
