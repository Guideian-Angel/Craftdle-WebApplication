import { StoneButton } from "../../components/StoneButton";
import { CraftingTable } from "./CraftingTable";
import { Cursor } from "./Cursor";
import { Hearts } from "./Hearts";
import { KnowledgeBook } from "./KnowledgeBook";
import { Tips } from "./Tips";
import { IItem, Items } from "../../classes/Items";
import { Inventory } from "./Inventory";
import { useEffect, useRef, useState, useCallback } from "react";
import { ITips } from "../../interfaces/ITips";
import { IRecipeCollection } from "../../interfaces/IRecipe";
import { useSearchParams } from "react-router-dom";
import { Hints } from "./Hints";
import { RootState, store } from "../../app/store";
import { useSelector } from "react-redux";
import { setHelp, setNewGame } from "../../features/game/gameSlice";
import { Meta } from "../../components/Meta";
import { GameOver } from "./GameOver";
import { SoundEffect } from "../../classes/Audio";
import { Tutorial } from "./Tutorial";
import { Button } from "../../components/Button";
import { LoadingScreen } from "./LoadingScreen";
import { setError } from "../../features/error/errorSlice";

/**
 * Gamemode names mapping.
 */
const gamemodeNames = {
    "1": "Tutorial",
    "2": "Classic",
    "3": "Daily",
    "4": "All in One",
    "5": "Pocket",
    "6": "Resource",
    "7": "Hardcore"
}

/**
 * Interface for the guess data.
 */
interface IGuess {
    items: Array<IItem>,
    recipes: IRecipeCollection,
    tips: ITips,
    hints: Array<string | null> | null,
    hearts: number | null,
    result: boolean
}

/**
 * Calculate the current turn based on the number of tips and the result of the previous turn.
 * 
 * @param numberOfTips - The total number of tips available.
 * @param result - Whether the previous turn was successful.
 * @returns The current turn number.
 */
function getTurn(numberOfTips: number, result: boolean) {
    const turn = numberOfTips - (result ? 1 : 0)
    return turn < 0 ? 0 : turn
}

/**
 * The main game component that manages the game interface, state, and interactions.
 * 
 * @returns A JSX element representing the game interface.
 */
export function Game() {
    const socket = useSelector((state: RootState) => state.socket.socket)
    const user = useSelector((state: RootState) => state.user)
    const [searchParams, setSearchParams] = useSearchParams();
    const gamemode = searchParams.get("gamemode");
    const isGamemodeValid = isNaN(Number(gamemode)) || gamemode == null || Number(gamemode) > 7 || Number(gamemode) < 1
    const gamemodeId = isGamemodeValid ? "1" : gamemode;
    const gamemodeName = gamemodeNames[gamemodeId as keyof typeof gamemodeNames]
    const craftingTableSize = gamemodeId == "5" ? 2 : 3;
    const [tableContent, setTableContent] = useState<Array<Array<HTMLImageElement | null>>>(
        Array.from({ length: craftingTableSize }, () =>
            Array.from({ length: craftingTableSize }, () => null)
        )
    );
    const [itemsCollection, setItemsCollection] = useState<Array<IItem>>([])
    const [recipes, setRecipes] = useState<IRecipeCollection>({})
    const [isKnowledgeBookOpen, setIsKnowledgeBookOpen] = useState(false);
    const [tips, setTips] = useState<ITips>([])
    const [hints, setHints] = useState<Array<string | null> | null>(null)
    const [maxHearts, setMaxHearts] = useState<number | null>(null)
    const [result, setResult] = useState(false)
    const [newTurn, setNewTurn] = useState(0)
    const [progress, setProgress] = useState<{ loaded: number; total: number }>({ loaded: 0, total: 1 });
    const items = useRef(new Items())
    const turn = getTurn(tips.length, result)

    /**
     * Start a new game.
     * @param gamemode - The gamemode to start.
     * @param newGame - Whether to start a new game.
     */
    const startGame = useCallback((gamemode: string, newGame: boolean) => {
        setTips([])
        socket?.emit("startGame", {
            gamemode: gamemode,
            newGame: newGame
        })
        setNewTurn(prev => prev + 1)
    }, [socket])

    async function loadImages(data: IGuess) {
        items.current.clearItems()
        const resource: { [id: string]: IItem } = {};
        data.items.concat(Object.keys(data.recipes).flatMap((recipeGroupName) => {
            return data.recipes[recipeGroupName].map((recipe) => recipe)
        })).forEach(image => {
            resource[image.id] = image
        })

        setProgress({
            loaded: 0,
            total: Object.keys(resource).length
        })

        setItemsCollection(data.items);
        setRecipes(data.recipes);

        Object.keys(resource).forEach(async (resourceName) => {
            if (await items.current.addItem(resource[resourceName])) {
                setProgress(prev => {
                    return {
                        loaded: prev.loaded + 1,
                        total: prev.total
                    }
                })
            } else {
                store.dispatch(setError("LoadingError"))
            }
        });
    }

    useEffect(() => {
        startGame(gamemodeId, store.getState().game.newGame)

        socket?.on("guess", (data: IGuess) => {
            if(data.items || data.recipes){
                loadImages(data)
            }
            setTips(data.tips)
            setHints(data.hints)
            setMaxHearts(data.hearts)
            setResult(data.result)
            setTableContent(Array.from({ length: craftingTableSize }, () => Array(3).fill(null)))
            if (!data.items || !data.recipes) {
                if (gamemodeId == "7" && !data.result) {
                    SoundEffect.play("hit")
                } else {
                    SoundEffect.play("drop")
                }
            }
            setTimeout(() => {
                const tipContainer = document.getElementById("tipsContainer")
                tipContainer?.scrollTo({
                    top: tipContainer.scrollHeight * -1,
                    behavior: "smooth"
                })
            }, 0);
        })

        return () => { socket?.off("guess") }
    }, [socket, craftingTableSize, gamemodeId, startGame])

    useEffect(() => {
        if (isGamemodeValid) {
            searchParams.set("gamemode", gamemodeId)
            setSearchParams(searchParams)
        }
    }, [searchParams, setSearchParams, gamemodeId, isGamemodeValid])

    if (progress.loaded < progress.total) {
        return <LoadingScreen total={progress.total} loaded={progress.loaded} />
    }

    return <>
        <Meta
            title={gamemodeName}
        />
        <div id="game">
            <nav>
                <StoneButton href="/singleplayer">Quit Game</StoneButton>
                <StoneButton onClick={() => {
                    startGame(gamemodeId, true)
                }}>New Game</StoneButton>
                {!user.isGuest && <StoneButton href="/settings" onClick={() => {
                    store.dispatch(setNewGame(false))
                }}>Settings</StoneButton>}
            </nav>
            <CraftingTable gamemode={Number(gamemodeId)} turn={turn} isHardcore={gamemodeId != "7"} craftingTable={tableContent} size={craftingTableSize} recipes={recipes} isKnowledgeBookOpen={isKnowledgeBookOpen} setIsKnowledgeBookOpen={setIsKnowledgeBookOpen} socket={socket} items={items.current}/>
            {maxHearts && <Hearts turn={turn} maxHearts={maxHearts} />}
            {gamemodeId !== "1" ? (
                hints && <Hints key={`${newTurn}-hints`} hints={hints} turn={turn} />
            ) : (
                !(progress.loaded < progress.total) && <>
                    <Button onClick={!result ? () => { store.dispatch(setHelp(true)) } : undefined} color="green">Ask Allay</Button>
                    <Tutorial key={`${newTurn}-tutorial`} turn={tips.length} />
                </>
            )}
            <Tips tips={tips} craftingTableSize={craftingTableSize} itemsCollection={items.current} />
            {
                itemsCollection.length > 0 && Object.keys(recipes).length > 0 ? (
                    <>
                        {gamemodeId != "7" && <KnowledgeBook itemCollection={itemsCollection} isOpen={isKnowledgeBookOpen} result={result} setCraftingTable={setTableContent} recipes={recipes} items={items.current} craftingTableSize={craftingTableSize} />}
                        <Inventory isOpen={!isKnowledgeBookOpen} itemsCollection={itemsCollection} items={items.current}/>
                    </>
                ) : null
            }
            {!result && <Cursor key={newTurn} craftingTableSize={craftingTableSize} craftingTableSlots={tableContent} setCraftingTableSlots={setTableContent} />}
            {
                maxHearts && turn >= maxHearts * 2 ? (
                    <GameOver startGame={() => { startGame(gamemodeId, true) }} />
                ) : null
            }
        </div>
    </>
}