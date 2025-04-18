import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState, store } from "../../app/store";
import { DefaultSettings } from "../../classes/DefaultSettings";
import { loadSettings } from "../../functions/loadSettings";
import { IControls } from "../../interfaces/ISettings";
import { Item } from "./Item";
import { isUserPlayingOnPC } from "../../functions/isUserPlayingOnPC";
import { SoundEffect } from "../../classes/Audio";
import { removeRequiredControl } from "../../features/game/gameSlice";
import { focus } from "../../classes/Focus";

/**
 * A helper function to find the key and index of a value in the controls object.
 * 
 * @param obj - The controls object containing key-value pairs.
 * @param value - The value to search for.
 * @returns The key and index as a string, or undefined if not found.
 */
function getKeyAndIndexByValue(obj: IControls, value: string): string | undefined {
    for (const key of Object.keys(obj)) {
        const currentValue = obj[key as keyof IControls];
        if (Array.isArray(currentValue)) {
            const index = currentValue.indexOf(value);
            if (index !== -1) return `${key}${index}`;
        } else if (currentValue === value) {
            return key;
        }
    }
    return undefined;
}

/**
 * Props for the Cursor component.
 */
interface CursorProps {
    craftingTableSlots: Array<Array<HTMLImageElement | null>>;
    setCraftingTableSlots: (value: Array<Array<HTMLImageElement | null>>) => void;
    craftingTableSize: number;
}

/**
 * A React component that handles the player's cursor interactions with the crafting table.
 * 
 * @param props - The properties for the Cursor component, including crafting table slots and size.
 * @returns A JSX element representing the cursor, or null if no item is picked up.
 */
function CursorRaw(props: CursorProps) {
    const customSettings = useSelector((state: RootState) => state.user.settings?.find(f => f.isSet === true));
    const currentSettings = customSettings || DefaultSettings.getDefaultSettings();

    const isHoldingCopy = useRef<boolean>(false);
    const [pickedUpItem, setPickedUpItem] = useState<HTMLImageElement | null>(null);
    const [cursorPos, setCursorPos] = useState<{ x: number, y: number }>();

    const isPCControl = isUserPlayingOnPC() && !currentSettings.controls.isTapMode

    useEffect(() => { loadSettings() }, []);

    useEffect(() => {
        function handleControl(key: string) {
            let control = getKeyAndIndexByValue(currentSettings.controls, key);
            let slotNumber: number | null = null
            if (control?.includes("tableMapping")) {
                slotNumber = Number(control.replace("tableMapping", ""))
                control = "tableMapping"
            }
            switch (control) {
                case "copy":
                    setPickedUpItem(focus.focusedItem);
                    if (!focus.focusedSlot?.classList.contains("copySlot")) placeItem();
                    if (focus.focusedItem) store.dispatch(removeRequiredControl("PickUp"))
                    break;
                case "remove":
                    removeItem()
                    break;
                case "tableMapping":
                    if(typeof slotNumber === "number"){
                        addToSlot(props.craftingTableSlots, slotNumber, focus.focusedItem)
                    }
                    if(focus.focusedItem) {
                        store.dispatch(removeRequiredControl("Place"))
                    }
                    break;
            }
        }

        function getSlotIndex() {
            const slotNumber = Number(focus.focusedSlot?.id.replace("slot", ""));
            return slotNumber || slotNumber === 0 ? slotNumber : undefined
        }

        function addToSlot(slots: Array<Array<HTMLImageElement | null>>, slotNumber: number, itemToPlace: HTMLImageElement | null) {
            const currentSlotItem = slots[Math.floor(slotNumber / 3)][slotNumber % 3];
            const row = Math.floor(slotNumber / 3);
            const column = slotNumber % 3;
            if(row < props.craftingTableSize && column < props.craftingTableSize)
            slots[row][column] = itemToPlace || null;
            props.setCraftingTableSlots([...slots]);
            return currentSlotItem
        }

        function removeItem() {
            const slots = props.craftingTableSlots;
            const slotNumber = getSlotIndex()
            if (slotNumber || slotNumber === 0) {
                addToSlot(slots, slotNumber, null)
            }
        }

        function placeItem() {
            const slots = props.craftingTableSlots;
            const slotNumber = getSlotIndex()
            if (slotNumber || slotNumber === 0) {
                const currentSlotItem = addToSlot(slots, slotNumber, pickedUpItem)
                if (isPCControl) {
                    setPickedUpItem(currentSlotItem || null);
                }
            }
        }

        function updateLocation(e: MouseEvent) {
            setCursorPos({ x: e.clientX, y: e.clientY });
            if (isHoldingCopy.current && pickedUpItem && focus.focusedSlot?.childNodes.length === 0) {
                const slots = props.craftingTableSlots;
                const slotNumber = getSlotIndex()
                if (slotNumber || slotNumber === 0) {
                    addToSlot(slots, slotNumber, pickedUpItem)
                    store.dispatch(removeRequiredControl("Copy"))
                }
            }
        }

        function handleMouseButtonPressed(e: MouseEvent) {
            const control = getKeyAndIndexByValue(currentSettings.controls, getMouseButton(e) ?? "");
            if (control === "copy") {
                isHoldingCopy.current = true
            }
        }

        function getMouseButton(e: MouseEvent) {
            let key = undefined
            if (e.button >= 0 && e.button <= 2) {
                switch (e.button) {
                    case 0:
                        key = "LMB";
                        break;
                    case 1:
                        key = "MMB";
                        break;
                    case 2:
                        key = "RMB";
                        break;
                }
            }
            return key
        }

        function handleMouseButtonRelease(e: MouseEvent) {
            const button = getMouseButton(e)
            if (button) handleControl(button)
            if (button) stopHolding(button)
        }

        function stopHolding(key: string) {
            const control = getKeyAndIndexByValue(currentSettings.controls, key);
            if (control === "copy") {
                isHoldingCopy.current = false
            }
        }

        function handleKeyPressed(e: KeyboardEvent) {
            const control = getKeyAndIndexByValue(currentSettings.controls, e.key.toUpperCase());
            if (control === "copy") {
                isHoldingCopy.current = true
            }
        }

        function handleKeyRelease(e: KeyboardEvent) {
            const button = e.key.toUpperCase()
            if (button) handleControl(button)
            if (button) stopHolding(button)
        }

        function handleTouch(e: MouseEvent) {
            const target = e.target as HTMLElement
            if (target?.classList?.contains("inventorySlot")) {
                selectSlot(target, target.childNodes[0] as HTMLImageElement)
            } else if (target.parentElement?.classList.contains("inventorySlot")) {
                selectSlot(target.parentElement, target as HTMLImageElement)
            } else if (target?.classList?.contains("craftingTableSlot")) {
                focus.focusedSlot = target
                if (target.childNodes.length > 0) {
                    removeItem()
                } else {
                    placeItem()
                }
            } else if (target?.parentElement?.classList?.contains("craftingTableSlot")) {
                focus.focusedSlot = target?.parentElement
                if (target.parentElement.childNodes.length > 0) {
                    removeItem()
                } else {
                    placeItem()
                }
            }
        }

        function selectSlot(slot: HTMLElement, item: HTMLImageElement) {
            setPickedUpItem(item)
            document.getElementById("selectedInventorySlot")?.removeAttribute("id")
            slot.id = "selectedInventorySlot"
            SoundEffect.play("click")
        }

        if (isPCControl) {
            document.addEventListener("mousemove", updateLocation);
            document.addEventListener("mousedown", handleMouseButtonPressed);
            document.addEventListener("mouseup", handleMouseButtonRelease)
            document.addEventListener("keydown", handleKeyPressed);
            document.addEventListener("keyup", handleKeyRelease);
        } else {
            document.addEventListener("mousedown", handleTouch);
        }

        return () => {
            document.removeEventListener("mousemove", updateLocation);
            document.removeEventListener("mousedown", handleMouseButtonPressed);
            document.removeEventListener("mouseup", handleMouseButtonRelease)
            document.removeEventListener("keydown", handleKeyPressed);
            document.removeEventListener("keyup", handleKeyRelease);

            document.removeEventListener("mousedown", handleTouch);
        };
    }, [pickedUpItem, currentSettings.controls, props.craftingTableSlots, isPCControl, props]);

    return pickedUpItem && isPCControl ? (
        <div id="pickedUpItem" style={{ top: cursorPos?.y, left: cursorPos?.x }}>
            <Item item={pickedUpItem} className="cursorItem" />
        </div>
    ) : null;
}

export const Cursor = React.memo(CursorRaw);