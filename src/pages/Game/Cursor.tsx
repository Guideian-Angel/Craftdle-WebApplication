import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { DefaultSettings } from "../../classes/DefaultSettings";
import { loadSettings } from "../../functions/loadSettings";
import { IControls } from "../../interfaces/ISettings";
import { Item } from "./Item";

function getKeyAndIndexByValue(obj: IControls, value: any): string | undefined {
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

interface CursorProps {
    craftingTableSlots: Array<Array<HTMLImageElement | null>>;
    setCraftingTableSlots: (value: Array<Array<HTMLImageElement | null>>) => void;
}

export function Cursor(props: CursorProps) {
    const customSettings = useSelector((state: RootState) => state.user.settings?.find(f => f.isSet === true));
    const currentSettings = customSettings || DefaultSettings.getDefaultSettings();
    
    const focusedItemRef = useRef<HTMLImageElement | null>(null);
    const focusedSlotRef = useRef<HTMLElement | null>(null);
    const [pickedUpItem, setPickedUpItem] = useState<HTMLImageElement | null>(null);
    const [cursorPos, setCursorPos] = useState<{ x: number, y: number }>();

    useEffect(() => {loadSettings()}, []);

    useEffect(() => {
        function handleControl(key: string) {
            const control = getKeyAndIndexByValue(currentSettings.controls, key);
            if (control === "copy") {
                setPickedUpItem(focusedItemRef.current);
                placeItem();
            }
        }

        function placeItem() {
            let slots = props.craftingTableSlots;
            const slotNumber = Number(focusedSlotRef.current?.id.replace("slot", ""));
            if (slotNumber || slotNumber === 0) {
                const currentSlotItem = slots[Math.floor(slotNumber / 3)][slotNumber % 3];
                slots[Math.floor(slotNumber / 3)][slotNumber % 3] = pickedUpItem || null;
                setPickedUpItem(currentSlotItem || null);
                props.setCraftingTableSlots([...slots]);
            }
        }

        function saveFocus(e: MouseEvent) {
            const target = e.target as HTMLElement;
            if (target.classList.contains("item") && focusedItemRef.current?.className !== target.className) {
                focusedItemRef.current = target as HTMLImageElement;
            } else if (target.classList.contains("slot")) {
                focusedSlotRef.current = target;
                focusedItemRef.current = null;
            } else {
                focusedSlotRef.current = null;
                focusedItemRef.current = null;
            }
        }

        function updateLocation(e: MouseEvent) {
            setCursorPos({ x: e.clientX, y: e.clientY });
        }

        function handleMouseButtonPressed(e: MouseEvent) {
            if (e.button >= 0 && e.button <= 2) {
                switch (e.button) {
                    case 0:
                        handleControl("Left Mouse Button");
                        break;
                    case 1:
                        handleControl("Middle Mouse Button");
                        break;
                    case 2:
                        handleControl("Right Mouse Button");
                        break;
                }
            }
        }

        document.addEventListener("mousemove", updateLocation);
        document.addEventListener("mouseover", saveFocus);
        document.addEventListener("mousedown", handleMouseButtonPressed);

        return () => {
            document.removeEventListener("mousemove", updateLocation);
            document.removeEventListener("mouseover", saveFocus);
            document.removeEventListener("mousedown", handleMouseButtonPressed);
        };
    }, [pickedUpItem, currentSettings.controls]);

    return pickedUpItem ? (
        <div id="pickedUpItem" style={{ top: cursorPos?.y, left: cursorPos?.x }}>
            <Item item={pickedUpItem} className="cursorItem" />
        </div>
    ) : null;
}
