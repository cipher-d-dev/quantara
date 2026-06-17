import logo from '../../assets/logo.png';

const Logo = () => {
    return (
        <div className="h-10 w-10 rounded-[25%] overflow-hidden">
            <img src={logo} alt="Quantara Logo" className="h-full w-full" />
        </div>
    )
}

export default Logo;