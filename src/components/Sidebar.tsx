import React from "react";
import { UIDataContext } from "../UIDataContext";

const Sidebar = () => {
    const { layers, toggleVisibility } = React.useContext(UIDataContext);
    return <div style={{ position: 'absolute', background: 'white', top: 0, width: '300px' }}>
        <h1>Sidebar</h1>
        <ul>
            {layers.map((c) => {
                return <li key={c.id}>
                    {c.name}
                    <input type="checkbox" checked={c.visible} onChange={() => toggleVisibility(c.id)} />
                </li>
            })}
        </ul>
    </div>
}

export default Sidebar;