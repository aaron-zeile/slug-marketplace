import { GoogleLogin,googleLogout } from "@react-oauth/google"

function handleLogout() {
    googleLogout();
    console.log("User logged out");
}
export function Landing() {
    return (
<>
    <GoogleLogin 
    onSuccess={credentialResponse => {
        console.log(credentialResponse);
    }}
    onError={() => {console.log("Login Failed");}}
    />
</>
    )
}
