import logo from '../../assets/logo.svg';
export default function AppLogo() {
    return (
        <>
            <div className="flex h-20 w-auto items-center justify-center py-4">
                <img src={logo} alt="Logo" className="h-full w-full object-contain" />
            </div>
        </>
    );
}
