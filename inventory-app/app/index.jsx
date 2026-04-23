import { Redirect } from 'expo-router';
//Ndodhet ne folder tabs qe ndodhet brenda folderit app
export default function Index() {

  return <Redirect href="./login" />;
}