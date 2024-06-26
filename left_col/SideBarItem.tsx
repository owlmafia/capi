import Link from "next/link"
import { useRouter } from "next/router"

// matchRoute (optional) set if needed to override the path to compare with the router's current path to mark the link as active,
// we need this because the router's path can be dynamic (e.g. [daoId]) and it will return literally the placeholder string,
// which will not match with the actual route
const SideBarItem = ({
  imageSrc,
  route,
  label,
  showBadge,
}: {
  imageSrc: any
  route: string
  label: string
  showBadge?: boolean
}) => {
  const router = useRouter()

  return (
    <Link
      //   TODO nextjs - what was this for actually?
      // end
      href={route}
      className={router.asPath === route ? "menu_active" : "menu_inactive"}
    >
      <div className="sidebar-item">
        <img src={imageSrc.src} alt="" />
        {label}
        {showBadge && <div className="settings-dot">{"1"}</div>}
      </div>
    </Link>
  )
}

export default SideBarItem
