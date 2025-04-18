import { IItem, Items } from "../../classes/Items"
import { Item } from "./Item"
import searchIcon from "../../assets/imgs/icons/search_icon.png"
import React, { useState } from "react"
import { DefaultSettings } from "../../classes/DefaultSettings"
import { RootState } from "../../app/store"
import { useSelector } from "react-redux"
import { focus } from "../../classes/Focus"

/**
 * Props for the Inventory component.
 */
interface InventoryProps {
    itemsCollection: IItem[]
    items: Items,
    isOpen: boolean
}

/**
 * Inventory component to display the player's inventory.
 * 
 * This component renders a searchable inventory grid. Each item in the inventory is displayed
 * as a slot, and users can filter items by typing in the search bar. The size of the slots
 * is dynamically adjusted based on user settings.
 * 
 * @param props - The properties for the Inventory component.
 * @param props.itemsCollection - The collection of items to display in the inventory.
 * @param props.items - The `Items` instance used to retrieve item details.
 * @param props.isOpen - A boolean indicating whether the inventory is open.
 * @returns The Inventory component.
 */
function InventoryRaw(props: InventoryProps) {
    const customSettings = useSelector((state: RootState) => state.user.settings?.find(f => f.isSet === true));
    const currentSettings = customSettings || DefaultSettings.getDefaultSettings();
    const [search, setSearch] = useState("")
    const size = `${currentSettings.imagesSize / 10 + 2.5}vmin`

    return <div id="inventory" style={{ display: props.isOpen ? "grid" : "none" }}>
        <header id="inventoryHeader">
            <h1 id="inventoryTitle">Inventory:</h1>
            <nav className="searchBar">
                <img className="searchIcon" src={searchIcon} alt="Search Icon" draggable={false} />
                <input type="text" id="inventorySearch" className="search" placeholder="Search..." onInput={(e) => { setSearch(e.currentTarget.value) }} />
            </nav>
        </header>
        <div id="inventoryContainer">
            <div id="inventoryContent">
                {
                    props.itemsCollection.map(item => {
                        return <div
                            key={item.id}
                            className="inventorySlot slot copySlot"
                            style={{
                                width: size,
                                height: size,
                                display: item.name.toLowerCase().includes(search.toLowerCase()) ? "flex" : "none"
                            }} 
                            onMouseEnter={(e) => focus.saveFocus(e.currentTarget)}
                            onMouseLeave={() => focus.saveFocus(null)}>
                            <Item item={props.items.getItem(item.id)} className="item" info={{ text: item.name }} />
                        </div>
                    })
                }
            </div>
        </div>
    </div>
}

export const Inventory = React.memo(InventoryRaw)