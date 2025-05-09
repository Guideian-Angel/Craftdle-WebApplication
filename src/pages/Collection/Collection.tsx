import { useEffect, useState } from "react";
import { RootState, store } from "../../app/store";
import { changeProfilePics, getCollection } from "../../features/user/dataRequestSlice";
import { StoneButton } from "../../components/StoneButton";
import { Achievement } from "../../components/Achievement";
import active from "../../assets/imgs/icons/checkmark.png";
import lock from "../../assets/imgs/icons/lock.png";
import xp from "../../assets/imgs/backgrounds/experience_bar_progress.png";
import xpBar from "../../assets/imgs/backgrounds/experience_bar_background.png";
import { useSelector } from "react-redux";
import { updateProfile } from "../../features/user/userSlice";
import { deleteInfo, setInfo } from "../../features/info/infoSlice";
import { IResponse } from "../../interfaces/IResponse";

/**
 * Interface for the collection data.
 */
interface ICollection {
    inventory: Array<{
        id: number;
        name: string;
        src: string;
        collected: boolean;
    }>;
    profilePictures: Array<{
        id: number;
        name: string;
        src: string;
        collected: boolean;
        active: boolean;
        unlock: string;
    }>;
    profileBorders: Array<{
        id: number;
        name: string;
        src: string;
        collected: boolean;
        active: boolean;
        unlock: string;
    }>;
    achievements: Array<{
        title: string;
        description: string;
        icon: string;
        progress: number;
        goal: number;
        rarity: number;
        collected: boolean;
    }>;
}

/**
 * Saves the user's profile changes (profile picture and border) to the store.
 * 
 * @param collection - The collection data.
 * @param setCollection - The function to update the collection state.
 */
function saveProfileChanges(collection: ICollection, setCollection: (value: ICollection) => void) {
    const profilePicture = collection.profilePictures.find((item) => item.active) || null;
    const profileBorder = collection.profileBorders.find((item) => item.active) || null;
    store.dispatch(changeProfilePics({
        profilePicture: profilePicture?.id || 0,
        profileBorder: profileBorder?.id || 0
    }));
    setCollection(collection);
    store.dispatch(updateProfile({
        profilePicture: profilePicture,
        profileBorder: profileBorder
    }));
}

/**
 * Counts the number of collected items in a list.
 * 
 * @param list - The list of items to count.
 * @returns A string representing the count in the format "(collected/total)".
 */
function counter(list: Array<{ collected: boolean }> | undefined) {
    return `(${list?.filter((item) => item.collected).length || 0}/${list?.length || 0})`;
}

/**
 * Collection component to display the user's collection of items, profile pictures, borders, and achievements.
 * It fetches the collection data from the server and allows users to manage their profile.
 * 
 * @returns The Collection component.
 */
export function Collection() {
    const user = useSelector((state: RootState) => state.user);
    const [collection, setCollection] = useState<ICollection | null>(null);

    /**
     * Fetches the user's collection from the server.
     */
    async function getUserCollection() {
        const response = await store.dispatch(getCollection());
        const res = (response.payload as IResponse);
        if (res.response) {
            setCollection(res.data.data as ICollection);
        }
    }

    useEffect(() => {
        if (user.loginToken) {
            getUserCollection();
        }
    }, [user]);

    return <div id="collection">
        <header id="collectionHeader">
            <nav>
                <StoneButton href="/">Back to Menu</StoneButton>
            </nav>
            <h1>Collection</h1>
        </header>
        <main id="collectionMain">
            <div id="collectionContainer">
                {user.isGuest ? <p id="collectionGuestNotice">You can only start collecting after creating an account!</p> : null}
                <section id="collectionAchievements">
                    <h2>Achievements {counter(collection?.achievements)}</h2>
                    <article>
                        {
                            collection?.achievements?.map((achievement, index) => {
                                return <div className={achievement.collected ? "" : "uncollectedItem"} key={index}>
                                    <Achievement key={index} achievement={achievement} />
                                    {achievement.goal && achievement.progress ? (
                                        <div className="progressBar">
                                            <img className="xpBar" src={xpBar} alt="XP bar" draggable={false} />
                                            <img className="xp" src={xp} alt="XP" draggable={false} style={{
                                                clipPath: `inset(0 ${100 - (achievement.progress / achievement.goal) * 100}% 0 0)`
                                            }} />
                                        </div>
                                    ) : null}
                                </div>
                            })
                        }
                    </article>
                </section>
                <section id="collectionProfilePicture">
                    <h2>Profile Pictures {counter(collection?.profilePictures)}</h2>
                    <article>
                        {
                            collection?.profilePictures?.map((item, index) => {
                                return <div
                                    className={`itemFrame ${item.collected ? "" : "uncollectedItem"}`}
                                    key={index}
                                    onClick={() => {
                                        if (item.collected && !item.active) {
                                            collection.profilePictures.forEach((element) => {
                                                element.active = element.id === item.id
                                            })
                                            saveProfileChanges({ ...collection }, setCollection)
                                        }
                                    }}
                                    onMouseMove={!item.collected ? (e) => {
                                        store.dispatch(setInfo({ x: e.clientX, y: e.clientY, title: "Requirements:", titleColor: "#00AA00", text: item.unlock }))
                                    } : undefined}
                                    onMouseLeave={!item.collected ? () => {
                                        store.dispatch(deleteInfo())
                                    } : undefined}
                                >
                                    <img src={`${import.meta.env.VITE_SERVER_URL}/assets/profilePictures/${item.src}`} alt={item.name} draggable={false} />
                                    {
                                        item.collected ? (
                                            item.active ? (
                                                <img className="activeProfileImage" src={active} alt="Active Profile Picture" draggable={false} />
                                            ) : (
                                                <img className="activeableProfileImage" src={active} alt="Activeable Profile Picture" draggable={false} />
                                            )
                                        ) : (
                                            <img className="uncollectedProfileImage" src={lock} alt="Uncollected Profile Picture" draggable={false} />
                                        )
                                    }
                                </div>
                            })
                        }
                    </article>
                </section>
                <section id="collectionProfileBorder">
                    <h2>Profile Borders {counter(collection?.profileBorders)}</h2>
                    <article>
                        {
                            collection?.profileBorders?.map((item, index) => {
                                return <div
                                    className={`itemFrame ${item.collected ? "" : "uncollectedItem"}`}
                                    key={index}
                                    onClick={() => {
                                        if (item.collected && !item.active) {
                                            collection.profileBorders.forEach((element) => {
                                                element.active = element.id === item.id
                                            })
                                            saveProfileChanges({ ...collection }, setCollection)
                                        }
                                    }}
                                    onMouseMove={!item.collected ? (e) => {
                                        store.dispatch(setInfo({ x: e.clientX, y: e.clientY, title: "Requirements:", titleColor: "#00AA00", text: item.unlock }))
                                    } : undefined}
                                    onMouseLeave={!item.collected ? () => {
                                        store.dispatch(deleteInfo())
                                    } : undefined}
                                >
                                    <img src={`${import.meta.env.VITE_SERVER_URL}/assets/profileBorders/${item.src}`} alt={item.name} draggable={false} />
                                    {
                                        item.collected ? (
                                            item.active ? (
                                                <img className="activeProfileImage" src={active} alt="Active Profile Border" draggable={false} />
                                            ) : (
                                                <img className="activeableProfileImage" src={active} alt="Activeable Profile Border" draggable={false} />
                                            )
                                        ) : (
                                            <img className="uncollectedProfileImage" src={lock} alt="Uncollected Profile Border" draggable={false} />
                                        )
                                    }
                                </div>
                            })
                        }
                    </article>
                </section>
                <section id="collectionInventory">
                    <h2>Inventory {counter(collection?.inventory)}</h2>
                    <article>
                        {
                            collection?.inventory?.map((item, index) => {
                                return <div className={`itemFrame ${item.collected ? "" : "uncollectedItem"}`} key={index}>
                                    <img src={`${import.meta.env.VITE_SERVER_URL}/assets/items/${item.src}`} alt={item.name} draggable={false} />
                                    {
                                        !item.collected ? (
                                            <img className="uncollectedProfileImage" src={lock} alt="Uncollected Item" draggable={false} />
                                        ) : (
                                            null
                                        )
                                    }
                                </div>
                            })
                        }
                    </article>
                </section>
            </div>
        </main>
    </div >
}