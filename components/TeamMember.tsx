import { TeamMemberJs } from "wasm/wasm"
import twitter from "../images/svg/twitter.svg"
import styles from "./team_member.module.sass"

export const TeamMember = ({ data }: { data: TeamMemberJs }) => {
  return (
    <div className={styles.team_member}>
      <div className={styles.top_row}>
        <img className={styles.pic} src={data.picture} alt="" />
        <div className={styles.filler} />
        <div className={styles.social_links}>
          {data.social_links.map((url: string) => (
            <SocialLink key={url} url={url} />
          ))}
        </div>
      </div>
      <div className={styles.name}>{data.name}</div>
      <div className={styles.role}>{data.role}</div>
      <div className={styles.separator} />
      <div className={styles.descr}>{data.descr}</div>
    </div>
  )
}

const SocialLink = ({ url }: { url: string }) => {
  return (
    <a href={url}>
      <SocialMediaImage url={url} />
    </a>
  )
}

const SocialMediaImage = ({ url }: { url: string }) => {
  var src: string
  if (url.includes("twitter")) {
    src = twitter.src
    // TODO other social media
  } else {
    // TODO generic link default
    src = twitter.src
  }
  return <img src={src} alt="" />
}