import { useSelector } from "react-redux";
import craftdleTitle from "../../assets/imgs/title/craftdle_title.png"
import { Countdown } from "../../components/Countdown"
import { RootState } from "../../app/store";

/**
 * Maintenance component to display the maintenance message and countdown.
 * @returns The Maintenance component.
 */
export function Maintenance() {
    const maintenance = useSelector((state: RootState) => state.maintenance);

    return <div id="maintenance">
        <main id="maintenanceMessage">
            {/* Display the Craftdle title and maintenance message */}
            <img id="craftdleMaintenanceTitle" src={craftdleTitle} alt="craftdle title" draggable={false}/>
            <h1 id="maintenanceTitle">Maintenance</h1>
            <p>Craftdle is currently undergoing scheduled maintenance. We apologize for any inconvenience and appreciate your patience. Don't worry—your streak has been frozen during the maintenance!</p>
            <p>Thank you,<br />The Guideian Angel Team</p>
            {/* Display the countdown timer for maintenance */}
            <p>Estimated End of Maintenance:<span id="maintenanceCountdown">
                <Countdown time={maintenance.countdown || 0}/>
            </span></p>
        </main>
    </div>
}