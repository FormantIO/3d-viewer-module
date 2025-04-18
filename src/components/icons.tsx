import React from 'react';

interface IIcon {
    active?: boolean;
}

export function LayerIcon({ active }: IIcon) {
    return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.00001 10.9267L4.35287 7.05273L9.00001 3.17878L13.6471 7.05273L9.00001 10.9267Z" stroke={active ? "#FFF" : "#BAC4E2"} strokeWidth="2" />
        <path fillRule="evenodd" clipRule="evenodd" d="M2.71179 11.4992L8.35968 16.2074L9 16.7411L9.64031 16.2074L15.2882 11.4992L13.7265 10.1973L9 14.1374L4.27352 10.1973L2.71179 11.4992Z" fill={active ? "#FFF" : "#BAC4E2"} />
    </svg>
}

export function TextIcon() {
    return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M15.75 3.01172H2.25V14.9883H15.75V3.01172ZM2.25 2.26172C1.83579 2.26172 1.5 2.59751 1.5 3.01172V14.9883C1.5 15.4025 1.83579 15.7383 2.25 15.7383H15.75C16.1642 15.7383 16.5 15.4025 16.5 14.9883V3.01172C16.5 2.59751 16.1642 2.26172 15.75 2.26172H2.25Z" fill="white" />
        <path d="M6.58801 12.7241L7.64617 13.082V13.7822H4.22272V13.0975L5.32756 12.7085L8.26861 4.22769L9.48238 4.02539L12.6724 12.7085L13.7773 13.082V13.7822H9.45126V13.082L10.4627 12.7707L10.0115 11.4014H7.02372L6.58801 12.7241ZM8.45535 7.19986L7.31938 10.5611H9.70024L8.45535 7.19986Z" fill="white" />
    </svg>
}

export function EyeIcon() {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M2.14398 11.4616C4.82104 7.02853 8.09047 4.54999 12 4.54999C15.9095 4.54999 19.179 7.02853 21.856 11.4616C22.0476 11.7789 22.048 12.1761 21.8571 12.4937C19.191 16.9292 15.921 19.4071 12 19.4071C8.07895 19.4071 4.80905 16.9292 2.14292 12.4937C1.95198 12.1761 1.95239 11.7789 2.14398 11.4616ZM4.17638 11.9797C6.57637 15.7502 9.1981 17.4071 12 17.4071C14.8019 17.4071 17.4236 15.7502 19.8236 11.9797C17.4121 8.20659 14.7903 6.54999 12 6.54999C9.20971 6.54999 6.58787 8.20659 4.17638 11.9797Z" fill="white" />
        <path fillRule="evenodd" clipRule="evenodd" d="M12.0644 14.9358C13.662 14.9358 14.9572 13.6406 14.9572 12.0429C14.9572 11.1993 14.5961 10.44 14.02 9.91118C13.505 9.43857 12.8184 9.15009 12.0644 9.15009C10.4667 9.15009 9.17151 10.4453 9.17151 12.0429C9.17151 13.6406 10.4667 14.9358 12.0644 14.9358Z" fill="white" />
    </svg>

}

export function EyeCloseIcon() {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M8.34223 14.6222C7.16729 14.0938 6.06407 13.3052 5.03075 12.2761L2.64019 14.2682L1.35983 12.7318L3.70532 10.7772C3.1631 10.087 2.64239 9.32476 2.14288 8.49375L3.85703 7.46338C6.34318 11.5994 9.07328 13.4071 12 13.4071C14.9266 13.4071 17.6567 11.5994 20.1429 7.46338L21.857 8.49375C21.3575 9.32474 20.8368 10.087 20.2946 10.7772L22.6402 12.7318L21.3598 14.2682L18.9692 12.2761C17.9359 13.3052 16.8327 14.0938 15.6578 14.6222L16.908 17.3309L15.092 18.169L13.7392 15.238C13.1743 15.3501 12.5946 15.4071 12 15.4071C11.4053 15.4071 10.8256 15.3501 10.2608 15.238L8.90796 18.169L7.09204 17.3309L8.34223 14.6222Z" fill="#657197" />
    </svg>


}

export function Warning() {
    return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 13H11V15H9V13ZM9 5H11V11H9V5ZM9.99 0C4.47 0 0 4.48 0 10C0 15.52 4.47 20 9.99 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 9.99 0ZM10 18C5.58 18 2 14.42 2 10C2 5.58 5.58 2 10 2C14.42 2 18 5.58 18 10C18 14.42 14.42 18 10 18Z" fill="#BAC4E2" />
    </svg>
}

export function ConfigArrow() {
    return <svg width="11" height="40" viewBox="0 0 11 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M6.23327 2L6.23327 40L4.7666 40L4.7666 2L6.23327 2Z" fill="#18D2FF" />
        <path fillRule="evenodd" clipRule="evenodd" d="M5.50546 2.90731L1.624 7.05859L0.586914 5.94941L4.98691 1.24352C5.2733 0.937231 5.73762 0.937231 6.024 1.24352L10.424 5.94941L9.38691 7.05859L5.50546 2.90731Z" fill="#18D2FF" />
    </svg>
}

export function CubeIcon({ active }: IIcon) {
    return <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M8.08613 2.48359L3.12933 5.27201L8.07188 7.84954L12.8565 5.16889L8.08613 2.48359ZM2.37227 12.288V6.49708L7.366 9.10129V15.1712L2.37227 12.288ZM8.80229 15.1712L13.796 12.288V6.28887L8.80229 9.08667V15.1712ZM8.53343 1.08716C8.25624 0.929304 7.91632 0.929281 7.63912 1.08709L0.935974 4.85791V13.1173L7.63226 16.9834C7.91188 17.1448 8.2564 17.1448 8.53602 16.9834L15.2323 13.1173V4.85805L8.53343 1.08716Z" fill={active ? "#657197" : "#BAC3E2"} />
    </svg>
}

export function MapIcon({ active }: IIcon) {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M14.7837 3.91547L21.29 6.52841V18.5193L14.7947 16.7683L8.96916 19.072L2.72583 16.7168V4.49317L8.95982 6.47238L14.7837 3.91547ZM14.2487 6.33463L9.76711 8.30221V16.6058L14.2487 14.8336V6.33463ZM15.391 6.31463V14.8577L19.29 15.9088V7.88046L15.391 6.31463ZM4.72583 7.22652L8.62476 8.46438V16.8045L4.72583 15.3337V7.22652Z" fill={active ? "#657197" : "#BAC3E2"} />
    </svg>

}

export function CheckIcon() {
    return <svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M13.5392 2.02248L4.48528 11.3639L0.162109 6.90344L1.23921 5.85948L4.48528 9.2086L12.4621 0.978516L13.5392 2.02248Z" fill="white" />
    </svg>

}

export function WaypointToggleIcon(){
    return <svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="1.125" cy="1.125" r="1.5" transform="matrix(-1 0 0 1 17.8438 7.69922)" stroke="#BAC4E2" strokeWidth="0.75"/>
    <circle cx="1.125" cy="1.125" r="1.5" transform="matrix(-1 0 0 1 13.4609 14.1641)" stroke="#BAC4E2" strokeWidth="0.75"/>
    <path d="M15.7656 10.2734L13.2578 13.8471" stroke="#BAC4E2" strokeWidth="0.75" strokeLinecap="round"/>
    <path d="M7.04688 10.2734L4.53906 13.8471" stroke="#BAC4E2" strokeWidth="0.75" strokeLinecap="round"/>
    <path d="M8.71094 10.2734L11.2187 13.8471" stroke="#BAC4E2" strokeWidth="0.75" strokeLinecap="round"/>
    <circle cx="1.125" cy="1.125" r="1.5" transform="matrix(-1 0 0 1 9.07812 7.69922)" stroke="#BAC4E2" strokeWidth="0.75"/>
    <circle cx="1.125" cy="1.125" r="1.5" transform="matrix(-1 0 0 1 4.69336 14.1641)" stroke="#BAC4E2" strokeWidth="0.75"/>
    </svg>    
}

interface BooleanProps{
    onClick?: ()=>void;
}
export function BooleanToggleTrueIcon({ onClick}: BooleanProps){
    return <svg width="36" height="22" viewBox="0 0 36 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask id="mask0_471_35715" maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="22">
    <path fillRule="evenodd" clipRule="evenodd" d={ "M36 0H0V22H36V0ZM25 21C30.5228 21 35 16.5228 35 11C35 5.47715 30.5228 1 25 1C19.4772 1 15 5.47715 15 11C15 16.5228 19.4772 21 25 21Z"} fill="#D9D9D9"/>
    </mask>
    <g mask="url(#mask0_471_35715)">
    <rect x="3" y="7" width="30" height="9" rx="4.5" fill="#282F45" onClick={()=>onClick && onClick()}/>
    </g>
    <circle cx={"25"} cy="11" r="8" fill={"#18D2FF"} onClick={()=>onClick && onClick()}/>
    </svg>    
}
export function BooleanToggleFalseIcon({ onClick}: BooleanProps){
    return <svg width="36" height="22" viewBox="0 0 36 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask id="mask0_508_180629" maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="22">
    <path fillRule="evenodd" clipRule="evenodd" d="M36 0H0V22H36V0ZM11 21C16.5228 21 21 16.5228 21 11C21 5.47715 16.5228 1 11 1C5.47715 1 1 5.47715 1 11C1 16.5228 5.47715 21 11 21Z" fill="#D9D9D9"/>
    </mask>
    <g mask="url(#mask0_508_180629)">
    <rect x="3" y="7" width="30" height="9" rx="4.5" fill="#282F45"/>
    </g>
    <circle cx="11" cy="11" r="8" fill="#BAC4E2"/>
    </svg>
}

export function WaypointsPathToggleIcon(){
    return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.29297 16.293L16.293 1.29297" stroke="#BAC4E2" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4"/>
    </svg>
}

export function PathToggleIcon(){
    return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.29297 16.293L16.293 1.29297" stroke="#18D2FF" strokeWidth="2" strokeLinecap="round"/>
    </svg>    
}

export function PathEyeIcon(){
    return <svg width="16" height="9" viewBox="0 0 16 9" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M5.25881 5.96492C4.37723 5.56852 3.54948 4.97678 2.7742 4.20449L0.98113 5.69872L0.020853 4.54639L1.78023 3.08024C1.37381 2.56284 0.983494 1.9914 0.609059 1.36849L1.89468 0.595703C3.75929 3.69771 5.80686 5.05352 8.00187 5.05352C10.1969 5.05352 12.2444 3.69771 14.1091 0.595703L15.3947 1.36849C15.0199 1.99189 14.6293 2.56374 14.2225 3.08145L15.9805 4.54639L15.0202 5.69872L13.2284 4.20558C12.4536 4.97721 11.6264 5.56852 10.7454 5.96472L11.6829 7.99609L10.321 8.62468L9.30648 6.42661C8.88276 6.51076 8.44793 6.55352 8.00187 6.55352C7.55597 6.55352 7.1213 6.5108 6.69773 6.4267L5.68328 8.62468L4.32134 7.99609L5.25881 5.96492Z" fill="#BAC4E2"/>
    </svg>    
}

export function CLoseIcon(){
    return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M12.9688 14.0304L3.96875 5.03039L5.02941 3.96973L14.0294 12.9697L12.9688 14.0304Z" fill="white"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M5.03125 14.0304L14.0312 5.03039L12.9706 3.96973L3.97059 12.9697L5.03125 14.0304Z" fill="white"/>
    </svg>
    
}