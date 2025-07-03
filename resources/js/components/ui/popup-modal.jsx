const identityModal = ({ children, title, type }) => {
    return (
        <div className="mx-4 w-full md:w-1/2" onClick={(e) => e.stopPropagation()}>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <h3 className={`text-lg font-bold mb-2 ${type ? 'text-foreground' : 'text-red-500'}`}>{title}</h3>
                <div className="text-sm text-muted-foreground">{children}</div>
            </div>
        </div>
    );
};

export default identityModal;
