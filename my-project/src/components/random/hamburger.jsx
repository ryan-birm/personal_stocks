'use client'

import Hamburger from 'hamburger-react'
import { useState } from 'react'

export default function HamburgerComponent() {
    const [isOpen, setIsOpen] = useState(false)
    return ( 
        <div>
            <Hamburger 
                size = {24}
                toggled={isOpen} //This is the state of the hamburger menu. If it is true, the hamburger menu is open. If it is false, the hamburger menu is closed.
                toggle={setIsOpen} //This is the function that toggles the state of the hamburger menu. If it is true, the hamburger menu is open. If it is false, the hamburger menu is closed.
            />
            {isOpen && (
                <div className="hamburger-menu">
                    <ol>
                        <li>Home</li>
                        <li>About</li>
                        <li>Contact</li>
                    </ol>
                </div>
            )}
        </div>
    )
}