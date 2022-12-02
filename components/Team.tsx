import { useEffect, useState } from "react"
import { TeamMemberJs } from "wasm/wasm"
import { Deps } from "../context/AppContext"
import { safe } from "../functions/utils"
import { AddTeamMember } from "./AddTeamMember"
import { ContentTitle } from "./ContentTitle"
import { TeamMember } from "./TeamMember"
import styles from "./team.module.sass"
import plus from "../images/svg/plus_purple.svg"
import Modal from "../modal/Modal"

export const Team = ({ deps }: { deps: Deps }) => {
  const [team, setTeam] = useState([])
  const [isAdding, setIsAdding] = useState(false)

  updateTeam(deps, setTeam)

  return (
    <div className="mt-80">
      <ContentTitle title={"Team"} />
      {!deps.dao?.team_url && <EmptyTeamView />}
      <div className={styles.grid}>
        <TeamMembers team={team} />
        {deps.myAddress && (
          <div className={styles.add_member}>
            <button
              className="btn_no_bg"
              onClick={async () => setIsAdding(true)}
            >
              <img src={plus.src} alt="icon" />
            </button>
          </div>
        )}
      </div>
      {isAdding && (
        <Modal title={"Add team member"} onClose={() => setIsAdding(false)}>
          <AddTeamMember
            deps={deps}
            prefillData={dummyPrefillData()}
            team={team}
            setTeam={setTeam}
            onAdded={() => setIsAdding(false)}
          />
        </Modal>
      )}
    </div>
  )
}

const dummyPrefillData = () => {
  return {
    name: "Foo Bar",
    role: "Founder",
    descr:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat",
    picture: "https://placekitten.com/200/300",
    social: "https://twitter.com",
  }
}

const TeamMembers = ({ team }: { team: TeamMemberJs[] }) => {
  return (
    <>
      {team.map((member) => (
        <TeamMember key={member.uuid} data={member} />
      ))}
    </>
  )
}

const EmptyTeamView = () => {
  return <div>{"No team yet"}</div>
}

const updateTeam = (deps: Deps, setTeam: (team: TeamMemberJs[]) => void) => {
  useEffect(() => {
    if (deps.wasm && deps.dao?.team_url) {
      safe(deps.notification, async () => {
        const team = await deps.wasm.getTeam({
          url: deps.dao?.team_url,
        })
        console.log({ team })
        setTeam(team.team)
      })
    }
  }, [deps.wasm, deps.dao?.team_url, deps.notification])
}
