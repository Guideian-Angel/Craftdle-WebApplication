import { useEffect, useState } from "react"
import { IProfileImage } from "../../interfaces/IProfileImage"
import { RootState, store } from "../../app/store"
import { getStats } from "../../features/user/dataRequestSlice"
import { StoneButton } from "../../components/StoneButton"
import { useSelector } from "react-redux"
import { IResponse } from "../../interfaces/IResponse"

/**
 * Interface for collection statistics.
 */
interface ICollectStat {
    collected: number
    collectable: number
}

/**
 * Interface for user statistics.
 */
interface IStats {
    username: string
    profilePicture: IProfileImage
    profileBorder: IProfileImage
    streak: number
    gamemodes: Array<{
        gamemodeName: string
        played: number
        solved: number
        fastestSolve: number | null
        color: string
    }>
    registrationDate: string
    performedAchievements: ICollectStat
    collectedRecipes: ICollectStat
}

/**
 * Stats component to display user statistics.
 * @returns The Stats component.
 */
export function Stats() {
    const user = useSelector((state: RootState) => state.user);
    const [stats, setStats] = useState<IStats | null>(null)
    const gameStats = {
        totalSolved: 0,
        totalPlayed: 0
    }

    /**
     * Fetch the user's statistics from the server.
     */
    async function getUserStats() {
        const response = await store.dispatch(getStats())
        const res = (response.payload as IResponse)
        if (res.response) {
            setStats(res.data.data as IStats)
        }
    }

    useEffect(() => {
        // Fetch stats when the user is logged in.
        if (user.loginToken) {
            getUserStats()
        }
    }, [user])

    return <div id="stats">
        <header id="statsHeader">
            <nav>
                {/* Navigation back to the main menu */}
                <StoneButton href="/">Back to Menu</StoneButton>
            </nav>
            <h1>Statistics</h1>
        </header>
        <main id="statsMain">
            <section className="account">
                {/* Display user profile picture and border */}
                <div className="profileBorder"
                    style={stats?.profileBorder ? {
                        backgroundImage: `url(${import.meta.env.VITE_SERVER_URL}/assets/profileBorders/${stats?.profileBorder?.src})`
                    } : {}}
                >
                    {stats?.profilePicture ? <img className="profilePicture" src={`${import.meta.env.VITE_SERVER_URL}/assets/profilePictures/${stats?.profilePicture?.src}`} alt={stats?.profilePicture?.name} draggable={false} /> : null}
                </div>
                <h2 className="profileName">{stats?.username}</h2>
            </section>
            <div>
                <section id="basicStats">
                    <h3>Basic Stats</h3>
                    <article>
                        {/* Display basic user statistics */}
                        <p>Streak: {stats?.streak}</p>
                        <p>Registration Date: {stats?.registrationDate}</p>
                        <p>Earned Achievements: {stats?.performedAchievements?.collected}/{stats?.performedAchievements?.collectable}</p>
                        <p>Collected Recipes: {stats?.collectedRecipes?.collected}/{stats?.collectedRecipes?.collectable}</p>
                    </article>
                </section>
                <section id="gamemodeStats">
                    <h3>Gamemode Stats</h3>
                    <article>
                        {
                            stats?.gamemodes?.map(gamemode => {
                                gameStats.totalSolved += gamemode.solved
                                gameStats.totalPlayed += gamemode.played
                                return <div key={gamemode.gamemodeName}>
                                    <h4 style={{ color: `#${gamemode.color}` }}>{gamemode.gamemodeName}</h4>
                                    <ul>
                                        {/* Display gamemode-specific statistics */}
                                        <li>Played: {gamemode.played}</li>
                                        <li>Solved: {gamemode.solved}</li>
                                        {gamemode.played ? <li>Win Rate: {Math.floor(gamemode.solved / gamemode.played * 100)}%</li> : null}
                                        {gamemode.fastestSolve ? <li>Fastest Solve: {gamemode.fastestSolve}</li> : null}
                                    </ul>
                                </div>
                            })
                        }
                        {/* Display overall game statistics */}
                        <p>Total played: {gameStats.totalPlayed}</p>
                        <p>Total solved: {gameStats.totalSolved}</p>
                        {gameStats.totalPlayed ? <p>Overall win rate: {Math.floor(gameStats.totalSolved / gameStats.totalPlayed * 100)}%</p> : null}
                    </article>
                </section>
            </div>
        </main>
    </div>
}