import './App.css';
import {useState, useEffect} from 'react'
import axios from 'axios'
import {storage} from './Firebase/firebase'
import { ref,listAll, getDownloadURL } from 'firebase/storage';
function App() {
  const [numOfImages, setNumOfImages] = useState();
  const [catLabel, setCatLabel] = useState();
  const [errorLabel, setErrorLabel] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(1);
  const [ip, setIp] = useState("");
  const [cloudLoc, setCloudLoc] = useState("");

  const [images, setImages] = useState([]);
  async function submitOnClick (e) {
    setImages([]);
    if (numOfImages===undefined || numOfImages<1|| catLabel ==="") {
      setErrorLabel("Invalid or incomplete data.");
      document.getElementById('numOfImages').className = 'numOfImagesField errorBorder';
    } else {
      setErrorLabel("");
      document.getElementById('numOfImages').className = 'numOfImagesField';
      console.log(numOfImages,catLabel)
      //send request to the fastapi
      
      fetch(`https://gan-backend.herokuapp.com/predict/?num_of_examples=${numOfImages}&label=${catLabel}&ip=${ip}`, {
          method: 'GET',
        }).then((res) => res.json())
        .then((data) =>{
          const imageFolder = data.folderName
          const firebaseList = ref(storage, imageFolder);
          listAll(firebaseList).then((response) => {
            response.items.forEach((item)=>{
              getDownloadURL(item).then((url)=>{
                setImages((prev)=>[...prev,url]);
              })
            })
            console.log(response)
          })
        })
    }
  }

  function onChangeNumOfImages(e) {
    if (e.target.value!=undefined) {
      document.getElementById('numOfImages').className = 'numOfImagesField';
      setNumOfImages(e.target.value);
    }
  }

  function onChangeAlphabet(e) {
    setCatLabel(e.target.value);
  }



  useEffect(() => {
    const fetchData = async () => {
        fetch('https://gan-backend.herokuapp.com/categories', {
          method: 'GET',
        }).then((res) => res.json())
        .then((data) =>{
          setCategories(data['categories']);
          setCatLabel(data['categories'][0])
          setLoading(0);
        })
    }
    fetchData();
    const getIp = async () => {
      const res = await axios.get('https://geolocation-db.com/json/')
      setIp(res.data.IPv4);
    }
    getIp();
  },[]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading===1){
    return <></>
  } else {
    return (
      <>
        <div className="titleBar">
          <span className="title">Urdu Alphabet Generator</span>
        </div>
        <div className="header">
            <div className="headerText">
                <p>
                We use modern artifical technique of generative adversarial networks to 
                to create urdu alphabets in an mnist format. Upon every request you make an image with random pixel value is created as noise data and is passed to our trained Generator
                which gives output the alphabet you chose. <b>Give it a try below</b>.
                </p>
            </div>
        </div>
        <div className="formInput">
            <div className="numOfImages">
                <div>
                    <label htmlFor="numOfImages" className="numOfImagesLabel">How many images?</label>
                </div>
                <div>
                    <input onChange={onChangeNumOfImages} id="numOfImages" type="number" className="numOfImagesField" placeholder="# of images"></input>
                </div>
            </div>
  
            <div className="alphabetLabel">
                <div>
                    <label htmlFor="alphabet" className="alphabetInputLabel">Choose alphabet</label>
                </div>
                <div>
                    <select onChange={onChangeAlphabet} id="alpahbet" name="alphabet" className="alphabetField" >
                        {categories.map((category, idx) => (
                          <option key={idx} value={category}>{category}</option>
                        ))}
                    </select>
                </div>
            </div>
  
            <div className="submitButtonContainer">
              <div>
                  <button onClick={submitOnClick} type="submit" className="submit">Submit</button>
              </div>
            </div>
        </div>
        <div className='errorLabelContainer'>
          <label className='errorLabel' >{errorLabel}</label> 
        </div>
  
        <div className='images'>
          <span className='imageHeading'>Results</span>
          <div>
          {images.map((url,idx)=>{
            return <img key={idx} className='image' src={url}/>
          })}
          </div>
        </div>
  
        <footer className="footer">
          <div className='projectLinkContainer'>
            <div className='projectLinkText'>
              <p>The project is uploaded at:</p>
            </div>
            <div className='githubIconContainer'>
              <svg className='githubIcon' width="24" height="24" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.8752 0C6.35986 0 -0.541504 6.90137 -0.541504 15.4167C-0.541504 23.932 6.35986 30.8333 14.8752 30.8333C23.3905 30.8333 30.2918 23.932 30.2918 15.4167C30.2918 6.90137 23.3905 0 14.8752 0ZM14.8752 3.08333C21.6742 3.08333 27.2085 8.61768 27.2085 15.4167C27.2085 16.1393 27.1362 16.8499 27.0158 17.5365C26.6364 17.4522 26.0763 17.3498 25.4259 17.3438C24.9442 17.3377 24.342 17.416 23.8361 17.4883C24.0107 16.9523 24.1252 16.3621 24.1252 15.7539C24.1252 14.2725 23.4025 12.8934 22.2463 11.7552C22.5654 10.5688 22.8786 8.53337 22.0535 7.70833C19.6146 7.70833 18.2656 9.44873 18.1994 9.53906C17.4466 9.3584 16.6698 9.25 15.8387 9.25C14.7728 9.25 13.755 9.44271 12.8035 9.73177L13.0926 9.49089C13.0926 9.49089 11.7376 7.61198 9.23844 7.61198C8.36524 8.49121 8.7627 10.7194 9.09391 11.8516C7.91357 12.9777 7.16683 14.3086 7.16683 15.7539C7.16683 16.2598 7.28727 16.7415 7.40772 17.1992C6.98014 17.151 5.43848 17.0065 4.80615 17.0065C4.24609 17.0065 3.37891 17.139 2.68636 17.2956C2.59001 16.6813 2.54183 16.055 2.54183 15.4167C2.54183 8.61768 8.07617 3.08333 14.8752 3.08333ZM4.80615 17.3919C5.41439 17.3919 7.26318 17.6087 7.50407 17.6328C7.53418 17.7171 7.56429 17.7954 7.60042 17.8737C6.93799 17.8135 5.65527 17.7231 4.80615 17.8255C4.24007 17.8918 3.51742 18.0965 2.87907 18.2591C2.83089 18.0664 2.77067 17.8797 2.73454 17.681C3.40902 17.5365 4.29427 17.3919 4.80615 17.3919ZM25.4259 17.7292C26.0402 17.7352 26.6003 17.8376 26.9676 17.9219C26.9495 18.0243 26.8953 18.1086 26.8713 18.2109C26.4798 18.1206 25.8355 17.9881 25.0887 17.9701C24.7274 17.964 24.1493 17.9821 23.6434 18.0182C23.6675 17.9701 23.6735 17.9219 23.6916 17.8737C24.2155 17.8014 24.884 17.7231 25.4259 17.7292ZM5.76969 18.1628C6.63688 18.1688 7.44987 18.229 7.79313 18.2591C8.6001 19.7647 10.2321 20.8787 12.7554 21.3424C12.1351 21.6857 11.5811 22.1675 11.1655 22.7396C10.8042 22.7697 10.4248 22.7878 10.0575 22.7878C8.98552 22.7878 8.31706 21.8302 7.74496 21.0052C7.16683 20.1802 6.45622 20.0898 6.05876 20.0417C5.65527 19.9935 5.51677 20.2223 5.72152 20.3789C6.89583 21.2822 7.31738 22.3542 7.79313 23.3177C8.2207 24.1849 9.118 24.6667 10.1056 24.6667H10.2983C10.2682 24.8353 10.2502 24.9919 10.2502 25.1484V26.8346C6.69108 25.3953 3.98112 22.3542 2.97542 18.5964C3.60775 18.4398 4.31836 18.2772 4.85433 18.2109C5.10124 18.1808 5.41439 18.1567 5.76969 18.1628ZM25.0887 18.3555C25.7813 18.3735 26.3955 18.506 26.7749 18.5964C25.9258 21.7881 23.8301 24.4438 21.0418 26.0638V25.1484C21.0418 23.8356 20.006 22.1494 18.5366 21.3424C20.9756 20.8968 22.5654 19.8309 23.4025 18.4036C23.9867 18.3615 24.6732 18.3434 25.0887 18.3555ZM15.646 24.6667C16.0675 24.6667 16.4168 25.016 16.4168 25.4375V27.6536C15.911 27.7199 15.3991 27.75 14.8752 27.75V25.4375C14.8752 25.016 15.2244 24.6667 15.646 24.6667ZM12.5627 26.2083C12.9842 26.2083 13.3335 26.5576 13.3335 26.9792V27.6536C12.8156 27.5874 12.2917 27.491 11.7918 27.3646V26.9792C11.7918 26.5576 12.1411 26.2083 12.5627 26.2083ZM18.7293 26.2083C19.1027 26.2083 19.4279 26.4793 19.5002 26.8346C19.0003 27.0394 18.4884 27.2261 17.9585 27.3646V26.9792C17.9585 26.5576 18.3078 26.2083 18.7293 26.2083Z" fill="white"/>
              </svg>
            </div>
          </div>
          <div className='creatorsContainer'>
            <div className='creatorsText'>
              <span>Creators</span>
            </div>
            <div className='creatorsLink'>
              <div className='ahris'>
                <div className='name'>
                  <span>Syed Muhammad Ahris</span>
                </div>
                <div className='links'>
                  <div className='linkedinIcon'>
                    <a target='_blank' href='https://www.linkedin.com/in/syed-muhammad-ahris-bb96b81ba/'>
                    <svg  width="24" height="24" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M25.2917 0.625H3.70833C2.00479 0.625 0.625 2.00479 0.625 3.70833V25.2917C0.625 26.9952 2.00479 28.375 3.70833 28.375H25.2917C26.9952 28.375 28.375 26.9952 28.375 25.2917V3.70833C28.375 2.00479 26.9952 0.625 25.2917 0.625ZM9.875 22.2083H5.98538V11.4167H9.875V22.2083ZM7.86158 9.43871C6.67296 9.43871 5.879 8.64629 5.879 7.58871C5.879 6.53113 6.67142 5.73871 7.99262 5.73871C9.18125 5.73871 9.97521 6.53113 9.97521 7.58871C9.97521 8.64629 9.18279 9.43871 7.86158 9.43871ZM23.75 22.2083H19.9852V16.3099C19.9852 14.6788 18.9816 14.3027 18.6055 14.3027C18.2293 14.3027 16.9744 14.554 16.9744 16.3099C16.9744 16.5612 16.9744 22.2083 16.9744 22.2083H13.0847V11.4167H16.9744V12.9229C17.4754 12.0441 18.479 11.4167 20.3614 11.4167C22.2438 11.4167 23.75 12.9229 23.75 16.3099V22.2083Z" fill="white"/>
                    </svg>
                    </a>
                  </div>
                  <div className='githubIcon'>
                    <a target='_blank' href='https://github.com/SyedAhris'>
                    <svg className='githubIcon' width="24" height="24" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.8752 0C6.35986 0 -0.541504 6.90137 -0.541504 15.4167C-0.541504 23.932 6.35986 30.8333 14.8752 30.8333C23.3905 30.8333 30.2918 23.932 30.2918 15.4167C30.2918 6.90137 23.3905 0 14.8752 0ZM14.8752 3.08333C21.6742 3.08333 27.2085 8.61768 27.2085 15.4167C27.2085 16.1393 27.1362 16.8499 27.0158 17.5365C26.6364 17.4522 26.0763 17.3498 25.4259 17.3438C24.9442 17.3377 24.342 17.416 23.8361 17.4883C24.0107 16.9523 24.1252 16.3621 24.1252 15.7539C24.1252 14.2725 23.4025 12.8934 22.2463 11.7552C22.5654 10.5688 22.8786 8.53337 22.0535 7.70833C19.6146 7.70833 18.2656 9.44873 18.1994 9.53906C17.4466 9.3584 16.6698 9.25 15.8387 9.25C14.7728 9.25 13.755 9.44271 12.8035 9.73177L13.0926 9.49089C13.0926 9.49089 11.7376 7.61198 9.23844 7.61198C8.36524 8.49121 8.7627 10.7194 9.09391 11.8516C7.91357 12.9777 7.16683 14.3086 7.16683 15.7539C7.16683 16.2598 7.28727 16.7415 7.40772 17.1992C6.98014 17.151 5.43848 17.0065 4.80615 17.0065C4.24609 17.0065 3.37891 17.139 2.68636 17.2956C2.59001 16.6813 2.54183 16.055 2.54183 15.4167C2.54183 8.61768 8.07617 3.08333 14.8752 3.08333ZM4.80615 17.3919C5.41439 17.3919 7.26318 17.6087 7.50407 17.6328C7.53418 17.7171 7.56429 17.7954 7.60042 17.8737C6.93799 17.8135 5.65527 17.7231 4.80615 17.8255C4.24007 17.8918 3.51742 18.0965 2.87907 18.2591C2.83089 18.0664 2.77067 17.8797 2.73454 17.681C3.40902 17.5365 4.29427 17.3919 4.80615 17.3919ZM25.4259 17.7292C26.0402 17.7352 26.6003 17.8376 26.9676 17.9219C26.9495 18.0243 26.8953 18.1086 26.8713 18.2109C26.4798 18.1206 25.8355 17.9881 25.0887 17.9701C24.7274 17.964 24.1493 17.9821 23.6434 18.0182C23.6675 17.9701 23.6735 17.9219 23.6916 17.8737C24.2155 17.8014 24.884 17.7231 25.4259 17.7292ZM5.76969 18.1628C6.63688 18.1688 7.44987 18.229 7.79313 18.2591C8.6001 19.7647 10.2321 20.8787 12.7554 21.3424C12.1351 21.6857 11.5811 22.1675 11.1655 22.7396C10.8042 22.7697 10.4248 22.7878 10.0575 22.7878C8.98552 22.7878 8.31706 21.8302 7.74496 21.0052C7.16683 20.1802 6.45622 20.0898 6.05876 20.0417C5.65527 19.9935 5.51677 20.2223 5.72152 20.3789C6.89583 21.2822 7.31738 22.3542 7.79313 23.3177C8.2207 24.1849 9.118 24.6667 10.1056 24.6667H10.2983C10.2682 24.8353 10.2502 24.9919 10.2502 25.1484V26.8346C6.69108 25.3953 3.98112 22.3542 2.97542 18.5964C3.60775 18.4398 4.31836 18.2772 4.85433 18.2109C5.10124 18.1808 5.41439 18.1567 5.76969 18.1628ZM25.0887 18.3555C25.7813 18.3735 26.3955 18.506 26.7749 18.5964C25.9258 21.7881 23.8301 24.4438 21.0418 26.0638V25.1484C21.0418 23.8356 20.006 22.1494 18.5366 21.3424C20.9756 20.8968 22.5654 19.8309 23.4025 18.4036C23.9867 18.3615 24.6732 18.3434 25.0887 18.3555ZM15.646 24.6667C16.0675 24.6667 16.4168 25.016 16.4168 25.4375V27.6536C15.911 27.7199 15.3991 27.75 14.8752 27.75V25.4375C14.8752 25.016 15.2244 24.6667 15.646 24.6667ZM12.5627 26.2083C12.9842 26.2083 13.3335 26.5576 13.3335 26.9792V27.6536C12.8156 27.5874 12.2917 27.491 11.7918 27.3646V26.9792C11.7918 26.5576 12.1411 26.2083 12.5627 26.2083ZM18.7293 26.2083C19.1027 26.2083 19.4279 26.4793 19.5002 26.8346C19.0003 27.0394 18.4884 27.2261 17.9585 27.3646V26.9792C17.9585 26.5576 18.3078 26.2083 18.7293 26.2083Z" fill="white"/>
                    </svg>
                    </a>
                  </div>
                </div>
              </div>
              <div className='nawshrvan'>
                <div className='name'>
                  <span>Nawshrvan Arshad</span>
                </div>
                <div className='links'>
                  <div className='linkedinIcon'>
                    <a target='_blank' href='https://www.linkedin.com/in/nawshrvan-arshad'>
                    <svg width="24" height="24" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M25.2917 0.625H3.70833C2.00479 0.625 0.625 2.00479 0.625 3.70833V25.2917C0.625 26.9952 2.00479 28.375 3.70833 28.375H25.2917C26.9952 28.375 28.375 26.9952 28.375 25.2917V3.70833C28.375 2.00479 26.9952 0.625 25.2917 0.625ZM9.875 22.2083H5.98538V11.4167H9.875V22.2083ZM7.86158 9.43871C6.67296 9.43871 5.879 8.64629 5.879 7.58871C5.879 6.53113 6.67142 5.73871 7.99262 5.73871C9.18125 5.73871 9.97521 6.53113 9.97521 7.58871C9.97521 8.64629 9.18279 9.43871 7.86158 9.43871ZM23.75 22.2083H19.9852V16.3099C19.9852 14.6788 18.9816 14.3027 18.6055 14.3027C18.2293 14.3027 16.9744 14.554 16.9744 16.3099C16.9744 16.5612 16.9744 22.2083 16.9744 22.2083H13.0847V11.4167H16.9744V12.9229C17.4754 12.0441 18.479 11.4167 20.3614 11.4167C22.2438 11.4167 23.75 12.9229 23.75 16.3099V22.2083Z" fill="white"/>
                    </svg>
                    </a>
                  </div>
                  <div className='githubIcon'>
                    <a target='_blank' href='https://github.com/Nawsh1337'>
                    <svg className='githubIcon' width="24" height="24" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.8752 0C6.35986 0 -0.541504 6.90137 -0.541504 15.4167C-0.541504 23.932 6.35986 30.8333 14.8752 30.8333C23.3905 30.8333 30.2918 23.932 30.2918 15.4167C30.2918 6.90137 23.3905 0 14.8752 0ZM14.8752 3.08333C21.6742 3.08333 27.2085 8.61768 27.2085 15.4167C27.2085 16.1393 27.1362 16.8499 27.0158 17.5365C26.6364 17.4522 26.0763 17.3498 25.4259 17.3438C24.9442 17.3377 24.342 17.416 23.8361 17.4883C24.0107 16.9523 24.1252 16.3621 24.1252 15.7539C24.1252 14.2725 23.4025 12.8934 22.2463 11.7552C22.5654 10.5688 22.8786 8.53337 22.0535 7.70833C19.6146 7.70833 18.2656 9.44873 18.1994 9.53906C17.4466 9.3584 16.6698 9.25 15.8387 9.25C14.7728 9.25 13.755 9.44271 12.8035 9.73177L13.0926 9.49089C13.0926 9.49089 11.7376 7.61198 9.23844 7.61198C8.36524 8.49121 8.7627 10.7194 9.09391 11.8516C7.91357 12.9777 7.16683 14.3086 7.16683 15.7539C7.16683 16.2598 7.28727 16.7415 7.40772 17.1992C6.98014 17.151 5.43848 17.0065 4.80615 17.0065C4.24609 17.0065 3.37891 17.139 2.68636 17.2956C2.59001 16.6813 2.54183 16.055 2.54183 15.4167C2.54183 8.61768 8.07617 3.08333 14.8752 3.08333ZM4.80615 17.3919C5.41439 17.3919 7.26318 17.6087 7.50407 17.6328C7.53418 17.7171 7.56429 17.7954 7.60042 17.8737C6.93799 17.8135 5.65527 17.7231 4.80615 17.8255C4.24007 17.8918 3.51742 18.0965 2.87907 18.2591C2.83089 18.0664 2.77067 17.8797 2.73454 17.681C3.40902 17.5365 4.29427 17.3919 4.80615 17.3919ZM25.4259 17.7292C26.0402 17.7352 26.6003 17.8376 26.9676 17.9219C26.9495 18.0243 26.8953 18.1086 26.8713 18.2109C26.4798 18.1206 25.8355 17.9881 25.0887 17.9701C24.7274 17.964 24.1493 17.9821 23.6434 18.0182C23.6675 17.9701 23.6735 17.9219 23.6916 17.8737C24.2155 17.8014 24.884 17.7231 25.4259 17.7292ZM5.76969 18.1628C6.63688 18.1688 7.44987 18.229 7.79313 18.2591C8.6001 19.7647 10.2321 20.8787 12.7554 21.3424C12.1351 21.6857 11.5811 22.1675 11.1655 22.7396C10.8042 22.7697 10.4248 22.7878 10.0575 22.7878C8.98552 22.7878 8.31706 21.8302 7.74496 21.0052C7.16683 20.1802 6.45622 20.0898 6.05876 20.0417C5.65527 19.9935 5.51677 20.2223 5.72152 20.3789C6.89583 21.2822 7.31738 22.3542 7.79313 23.3177C8.2207 24.1849 9.118 24.6667 10.1056 24.6667H10.2983C10.2682 24.8353 10.2502 24.9919 10.2502 25.1484V26.8346C6.69108 25.3953 3.98112 22.3542 2.97542 18.5964C3.60775 18.4398 4.31836 18.2772 4.85433 18.2109C5.10124 18.1808 5.41439 18.1567 5.76969 18.1628ZM25.0887 18.3555C25.7813 18.3735 26.3955 18.506 26.7749 18.5964C25.9258 21.7881 23.8301 24.4438 21.0418 26.0638V25.1484C21.0418 23.8356 20.006 22.1494 18.5366 21.3424C20.9756 20.8968 22.5654 19.8309 23.4025 18.4036C23.9867 18.3615 24.6732 18.3434 25.0887 18.3555ZM15.646 24.6667C16.0675 24.6667 16.4168 25.016 16.4168 25.4375V27.6536C15.911 27.7199 15.3991 27.75 14.8752 27.75V25.4375C14.8752 25.016 15.2244 24.6667 15.646 24.6667ZM12.5627 26.2083C12.9842 26.2083 13.3335 26.5576 13.3335 26.9792V27.6536C12.8156 27.5874 12.2917 27.491 11.7918 27.3646V26.9792C11.7918 26.5576 12.1411 26.2083 12.5627 26.2083ZM18.7293 26.2083C19.1027 26.2083 19.4279 26.4793 19.5002 26.8346C19.0003 27.0394 18.4884 27.2261 17.9585 27.3646V26.9792C17.9585 26.5576 18.3078 26.2083 18.7293 26.2083Z" fill="white"/>
                    </svg>
                    </a>
                  </div>
                </div>
              </div>
              <div className='ruhal'>
                <div className='name'>
                  <span>Ruhal Lohana</span>
                </div>
                <div className='links'>
                  <div className='linkedinIcon'>
                    <a target='_blank' href='https://www.linkedin.com/in/ruhal-lohana-790564210'>
                    <svg width="24" height="24" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M25.2917 0.625H3.70833C2.00479 0.625 0.625 2.00479 0.625 3.70833V25.2917C0.625 26.9952 2.00479 28.375 3.70833 28.375H25.2917C26.9952 28.375 28.375 26.9952 28.375 25.2917V3.70833C28.375 2.00479 26.9952 0.625 25.2917 0.625ZM9.875 22.2083H5.98538V11.4167H9.875V22.2083ZM7.86158 9.43871C6.67296 9.43871 5.879 8.64629 5.879 7.58871C5.879 6.53113 6.67142 5.73871 7.99262 5.73871C9.18125 5.73871 9.97521 6.53113 9.97521 7.58871C9.97521 8.64629 9.18279 9.43871 7.86158 9.43871ZM23.75 22.2083H19.9852V16.3099C19.9852 14.6788 18.9816 14.3027 18.6055 14.3027C18.2293 14.3027 16.9744 14.554 16.9744 16.3099C16.9744 16.5612 16.9744 22.2083 16.9744 22.2083H13.0847V11.4167H16.9744V12.9229C17.4754 12.0441 18.479 11.4167 20.3614 11.4167C22.2438 11.4167 23.75 12.9229 23.75 16.3099V22.2083Z" fill="white"/>
                    </svg>
                    </a>
                  </div>
                  <div className='githubIcon'>
                    <a target='_blank' href='https://github.com/rklohana'>
                    <svg className='githubIcon' width="24" height="24" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.8752 0C6.35986 0 -0.541504 6.90137 -0.541504 15.4167C-0.541504 23.932 6.35986 30.8333 14.8752 30.8333C23.3905 30.8333 30.2918 23.932 30.2918 15.4167C30.2918 6.90137 23.3905 0 14.8752 0ZM14.8752 3.08333C21.6742 3.08333 27.2085 8.61768 27.2085 15.4167C27.2085 16.1393 27.1362 16.8499 27.0158 17.5365C26.6364 17.4522 26.0763 17.3498 25.4259 17.3438C24.9442 17.3377 24.342 17.416 23.8361 17.4883C24.0107 16.9523 24.1252 16.3621 24.1252 15.7539C24.1252 14.2725 23.4025 12.8934 22.2463 11.7552C22.5654 10.5688 22.8786 8.53337 22.0535 7.70833C19.6146 7.70833 18.2656 9.44873 18.1994 9.53906C17.4466 9.3584 16.6698 9.25 15.8387 9.25C14.7728 9.25 13.755 9.44271 12.8035 9.73177L13.0926 9.49089C13.0926 9.49089 11.7376 7.61198 9.23844 7.61198C8.36524 8.49121 8.7627 10.7194 9.09391 11.8516C7.91357 12.9777 7.16683 14.3086 7.16683 15.7539C7.16683 16.2598 7.28727 16.7415 7.40772 17.1992C6.98014 17.151 5.43848 17.0065 4.80615 17.0065C4.24609 17.0065 3.37891 17.139 2.68636 17.2956C2.59001 16.6813 2.54183 16.055 2.54183 15.4167C2.54183 8.61768 8.07617 3.08333 14.8752 3.08333ZM4.80615 17.3919C5.41439 17.3919 7.26318 17.6087 7.50407 17.6328C7.53418 17.7171 7.56429 17.7954 7.60042 17.8737C6.93799 17.8135 5.65527 17.7231 4.80615 17.8255C4.24007 17.8918 3.51742 18.0965 2.87907 18.2591C2.83089 18.0664 2.77067 17.8797 2.73454 17.681C3.40902 17.5365 4.29427 17.3919 4.80615 17.3919ZM25.4259 17.7292C26.0402 17.7352 26.6003 17.8376 26.9676 17.9219C26.9495 18.0243 26.8953 18.1086 26.8713 18.2109C26.4798 18.1206 25.8355 17.9881 25.0887 17.9701C24.7274 17.964 24.1493 17.9821 23.6434 18.0182C23.6675 17.9701 23.6735 17.9219 23.6916 17.8737C24.2155 17.8014 24.884 17.7231 25.4259 17.7292ZM5.76969 18.1628C6.63688 18.1688 7.44987 18.229 7.79313 18.2591C8.6001 19.7647 10.2321 20.8787 12.7554 21.3424C12.1351 21.6857 11.5811 22.1675 11.1655 22.7396C10.8042 22.7697 10.4248 22.7878 10.0575 22.7878C8.98552 22.7878 8.31706 21.8302 7.74496 21.0052C7.16683 20.1802 6.45622 20.0898 6.05876 20.0417C5.65527 19.9935 5.51677 20.2223 5.72152 20.3789C6.89583 21.2822 7.31738 22.3542 7.79313 23.3177C8.2207 24.1849 9.118 24.6667 10.1056 24.6667H10.2983C10.2682 24.8353 10.2502 24.9919 10.2502 25.1484V26.8346C6.69108 25.3953 3.98112 22.3542 2.97542 18.5964C3.60775 18.4398 4.31836 18.2772 4.85433 18.2109C5.10124 18.1808 5.41439 18.1567 5.76969 18.1628ZM25.0887 18.3555C25.7813 18.3735 26.3955 18.506 26.7749 18.5964C25.9258 21.7881 23.8301 24.4438 21.0418 26.0638V25.1484C21.0418 23.8356 20.006 22.1494 18.5366 21.3424C20.9756 20.8968 22.5654 19.8309 23.4025 18.4036C23.9867 18.3615 24.6732 18.3434 25.0887 18.3555ZM15.646 24.6667C16.0675 24.6667 16.4168 25.016 16.4168 25.4375V27.6536C15.911 27.7199 15.3991 27.75 14.8752 27.75V25.4375C14.8752 25.016 15.2244 24.6667 15.646 24.6667ZM12.5627 26.2083C12.9842 26.2083 13.3335 26.5576 13.3335 26.9792V27.6536C12.8156 27.5874 12.2917 27.491 11.7918 27.3646V26.9792C11.7918 26.5576 12.1411 26.2083 12.5627 26.2083ZM18.7293 26.2083C19.1027 26.2083 19.4279 26.4793 19.5002 26.8346C19.0003 27.0394 18.4884 27.2261 17.9585 27.3646V26.9792C17.9585 26.5576 18.3078 26.2083 18.7293 26.2083Z" fill="white"/>
                    </svg>
                    </a>
                  </div>
                </div>
              </div>
              <div className='sundar'>
                <div className='name'>
                  <span>Sundar Ali</span>
                </div>
                <div className='links'>
                  <div className='linkedinIcon'>
                    <a target='_blank' href='https://www.linkedin.com/in/sunder-ali-685823145'>
                    <svg width="24" height="24" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M25.2917 0.625H3.70833C2.00479 0.625 0.625 2.00479 0.625 3.70833V25.2917C0.625 26.9952 2.00479 28.375 3.70833 28.375H25.2917C26.9952 28.375 28.375 26.9952 28.375 25.2917V3.70833C28.375 2.00479 26.9952 0.625 25.2917 0.625ZM9.875 22.2083H5.98538V11.4167H9.875V22.2083ZM7.86158 9.43871C6.67296 9.43871 5.879 8.64629 5.879 7.58871C5.879 6.53113 6.67142 5.73871 7.99262 5.73871C9.18125 5.73871 9.97521 6.53113 9.97521 7.58871C9.97521 8.64629 9.18279 9.43871 7.86158 9.43871ZM23.75 22.2083H19.9852V16.3099C19.9852 14.6788 18.9816 14.3027 18.6055 14.3027C18.2293 14.3027 16.9744 14.554 16.9744 16.3099C16.9744 16.5612 16.9744 22.2083 16.9744 22.2083H13.0847V11.4167H16.9744V12.9229C17.4754 12.0441 18.479 11.4167 20.3614 11.4167C22.2438 11.4167 23.75 12.9229 23.75 16.3099V22.2083Z" fill="white"/>
                    </svg>
                    </a>
                  </div>
                  <div className='githubIcon'>
                    <a target='_blank' href='https://github.com/SunderAli416'>
                    <svg className='githubIcon' width="24" height="24" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.8752 0C6.35986 0 -0.541504 6.90137 -0.541504 15.4167C-0.541504 23.932 6.35986 30.8333 14.8752 30.8333C23.3905 30.8333 30.2918 23.932 30.2918 15.4167C30.2918 6.90137 23.3905 0 14.8752 0ZM14.8752 3.08333C21.6742 3.08333 27.2085 8.61768 27.2085 15.4167C27.2085 16.1393 27.1362 16.8499 27.0158 17.5365C26.6364 17.4522 26.0763 17.3498 25.4259 17.3438C24.9442 17.3377 24.342 17.416 23.8361 17.4883C24.0107 16.9523 24.1252 16.3621 24.1252 15.7539C24.1252 14.2725 23.4025 12.8934 22.2463 11.7552C22.5654 10.5688 22.8786 8.53337 22.0535 7.70833C19.6146 7.70833 18.2656 9.44873 18.1994 9.53906C17.4466 9.3584 16.6698 9.25 15.8387 9.25C14.7728 9.25 13.755 9.44271 12.8035 9.73177L13.0926 9.49089C13.0926 9.49089 11.7376 7.61198 9.23844 7.61198C8.36524 8.49121 8.7627 10.7194 9.09391 11.8516C7.91357 12.9777 7.16683 14.3086 7.16683 15.7539C7.16683 16.2598 7.28727 16.7415 7.40772 17.1992C6.98014 17.151 5.43848 17.0065 4.80615 17.0065C4.24609 17.0065 3.37891 17.139 2.68636 17.2956C2.59001 16.6813 2.54183 16.055 2.54183 15.4167C2.54183 8.61768 8.07617 3.08333 14.8752 3.08333ZM4.80615 17.3919C5.41439 17.3919 7.26318 17.6087 7.50407 17.6328C7.53418 17.7171 7.56429 17.7954 7.60042 17.8737C6.93799 17.8135 5.65527 17.7231 4.80615 17.8255C4.24007 17.8918 3.51742 18.0965 2.87907 18.2591C2.83089 18.0664 2.77067 17.8797 2.73454 17.681C3.40902 17.5365 4.29427 17.3919 4.80615 17.3919ZM25.4259 17.7292C26.0402 17.7352 26.6003 17.8376 26.9676 17.9219C26.9495 18.0243 26.8953 18.1086 26.8713 18.2109C26.4798 18.1206 25.8355 17.9881 25.0887 17.9701C24.7274 17.964 24.1493 17.9821 23.6434 18.0182C23.6675 17.9701 23.6735 17.9219 23.6916 17.8737C24.2155 17.8014 24.884 17.7231 25.4259 17.7292ZM5.76969 18.1628C6.63688 18.1688 7.44987 18.229 7.79313 18.2591C8.6001 19.7647 10.2321 20.8787 12.7554 21.3424C12.1351 21.6857 11.5811 22.1675 11.1655 22.7396C10.8042 22.7697 10.4248 22.7878 10.0575 22.7878C8.98552 22.7878 8.31706 21.8302 7.74496 21.0052C7.16683 20.1802 6.45622 20.0898 6.05876 20.0417C5.65527 19.9935 5.51677 20.2223 5.72152 20.3789C6.89583 21.2822 7.31738 22.3542 7.79313 23.3177C8.2207 24.1849 9.118 24.6667 10.1056 24.6667H10.2983C10.2682 24.8353 10.2502 24.9919 10.2502 25.1484V26.8346C6.69108 25.3953 3.98112 22.3542 2.97542 18.5964C3.60775 18.4398 4.31836 18.2772 4.85433 18.2109C5.10124 18.1808 5.41439 18.1567 5.76969 18.1628ZM25.0887 18.3555C25.7813 18.3735 26.3955 18.506 26.7749 18.5964C25.9258 21.7881 23.8301 24.4438 21.0418 26.0638V25.1484C21.0418 23.8356 20.006 22.1494 18.5366 21.3424C20.9756 20.8968 22.5654 19.8309 23.4025 18.4036C23.9867 18.3615 24.6732 18.3434 25.0887 18.3555ZM15.646 24.6667C16.0675 24.6667 16.4168 25.016 16.4168 25.4375V27.6536C15.911 27.7199 15.3991 27.75 14.8752 27.75V25.4375C14.8752 25.016 15.2244 24.6667 15.646 24.6667ZM12.5627 26.2083C12.9842 26.2083 13.3335 26.5576 13.3335 26.9792V27.6536C12.8156 27.5874 12.2917 27.491 11.7918 27.3646V26.9792C11.7918 26.5576 12.1411 26.2083 12.5627 26.2083ZM18.7293 26.2083C19.1027 26.2083 19.4279 26.4793 19.5002 26.8346C19.0003 27.0394 18.4884 27.2261 17.9585 27.3646V26.9792C17.9585 26.5576 18.3078 26.2083 18.7293 26.2083Z" fill="white"/>
                    </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='mentorContainer'>
            <div className='mentorText'>
              <span>Mentor</span>
            </div>
            <div className='mentorLink'>
              <div className='bahawal'>
                <div className='name'>
                  <span>Bahawal Khan Baloch</span>
                </div>
                <div className='links'>
                  <div className='linkedinIcon'>
                    <a target="_blank" href='https://www.linkedin.com/in/bahawalkbaloch/'>
                    <svg width="24" height="24" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M25.2917 0.625H3.70833C2.00479 0.625 0.625 2.00479 0.625 3.70833V25.2917C0.625 26.9952 2.00479 28.375 3.70833 28.375H25.2917C26.9952 28.375 28.375 26.9952 28.375 25.2917V3.70833C28.375 2.00479 26.9952 0.625 25.2917 0.625ZM9.875 22.2083H5.98538V11.4167H9.875V22.2083ZM7.86158 9.43871C6.67296 9.43871 5.879 8.64629 5.879 7.58871C5.879 6.53113 6.67142 5.73871 7.99262 5.73871C9.18125 5.73871 9.97521 6.53113 9.97521 7.58871C9.97521 8.64629 9.18279 9.43871 7.86158 9.43871ZM23.75 22.2083H19.9852V16.3099C19.9852 14.6788 18.9816 14.3027 18.6055 14.3027C18.2293 14.3027 16.9744 14.554 16.9744 16.3099C16.9744 16.5612 16.9744 22.2083 16.9744 22.2083H13.0847V11.4167H16.9744V12.9229C17.4754 12.0441 18.479 11.4167 20.3614 11.4167C22.2438 11.4167 23.75 12.9229 23.75 16.3099V22.2083Z" fill="white"/>
                    </svg>
                    </a>
                  </div>
                  <div className='githubIcon'>
                  <a target="_blank" href='https://github.com/bahawal32'>
                    <svg className='githubIcon' width="24" height="24" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.8752 0C6.35986 0 -0.541504 6.90137 -0.541504 15.4167C-0.541504 23.932 6.35986 30.8333 14.8752 30.8333C23.3905 30.8333 30.2918 23.932 30.2918 15.4167C30.2918 6.90137 23.3905 0 14.8752 0ZM14.8752 3.08333C21.6742 3.08333 27.2085 8.61768 27.2085 15.4167C27.2085 16.1393 27.1362 16.8499 27.0158 17.5365C26.6364 17.4522 26.0763 17.3498 25.4259 17.3438C24.9442 17.3377 24.342 17.416 23.8361 17.4883C24.0107 16.9523 24.1252 16.3621 24.1252 15.7539C24.1252 14.2725 23.4025 12.8934 22.2463 11.7552C22.5654 10.5688 22.8786 8.53337 22.0535 7.70833C19.6146 7.70833 18.2656 9.44873 18.1994 9.53906C17.4466 9.3584 16.6698 9.25 15.8387 9.25C14.7728 9.25 13.755 9.44271 12.8035 9.73177L13.0926 9.49089C13.0926 9.49089 11.7376 7.61198 9.23844 7.61198C8.36524 8.49121 8.7627 10.7194 9.09391 11.8516C7.91357 12.9777 7.16683 14.3086 7.16683 15.7539C7.16683 16.2598 7.28727 16.7415 7.40772 17.1992C6.98014 17.151 5.43848 17.0065 4.80615 17.0065C4.24609 17.0065 3.37891 17.139 2.68636 17.2956C2.59001 16.6813 2.54183 16.055 2.54183 15.4167C2.54183 8.61768 8.07617 3.08333 14.8752 3.08333ZM4.80615 17.3919C5.41439 17.3919 7.26318 17.6087 7.50407 17.6328C7.53418 17.7171 7.56429 17.7954 7.60042 17.8737C6.93799 17.8135 5.65527 17.7231 4.80615 17.8255C4.24007 17.8918 3.51742 18.0965 2.87907 18.2591C2.83089 18.0664 2.77067 17.8797 2.73454 17.681C3.40902 17.5365 4.29427 17.3919 4.80615 17.3919ZM25.4259 17.7292C26.0402 17.7352 26.6003 17.8376 26.9676 17.9219C26.9495 18.0243 26.8953 18.1086 26.8713 18.2109C26.4798 18.1206 25.8355 17.9881 25.0887 17.9701C24.7274 17.964 24.1493 17.9821 23.6434 18.0182C23.6675 17.9701 23.6735 17.9219 23.6916 17.8737C24.2155 17.8014 24.884 17.7231 25.4259 17.7292ZM5.76969 18.1628C6.63688 18.1688 7.44987 18.229 7.79313 18.2591C8.6001 19.7647 10.2321 20.8787 12.7554 21.3424C12.1351 21.6857 11.5811 22.1675 11.1655 22.7396C10.8042 22.7697 10.4248 22.7878 10.0575 22.7878C8.98552 22.7878 8.31706 21.8302 7.74496 21.0052C7.16683 20.1802 6.45622 20.0898 6.05876 20.0417C5.65527 19.9935 5.51677 20.2223 5.72152 20.3789C6.89583 21.2822 7.31738 22.3542 7.79313 23.3177C8.2207 24.1849 9.118 24.6667 10.1056 24.6667H10.2983C10.2682 24.8353 10.2502 24.9919 10.2502 25.1484V26.8346C6.69108 25.3953 3.98112 22.3542 2.97542 18.5964C3.60775 18.4398 4.31836 18.2772 4.85433 18.2109C5.10124 18.1808 5.41439 18.1567 5.76969 18.1628ZM25.0887 18.3555C25.7813 18.3735 26.3955 18.506 26.7749 18.5964C25.9258 21.7881 23.8301 24.4438 21.0418 26.0638V25.1484C21.0418 23.8356 20.006 22.1494 18.5366 21.3424C20.9756 20.8968 22.5654 19.8309 23.4025 18.4036C23.9867 18.3615 24.6732 18.3434 25.0887 18.3555ZM15.646 24.6667C16.0675 24.6667 16.4168 25.016 16.4168 25.4375V27.6536C15.911 27.7199 15.3991 27.75 14.8752 27.75V25.4375C14.8752 25.016 15.2244 24.6667 15.646 24.6667ZM12.5627 26.2083C12.9842 26.2083 13.3335 26.5576 13.3335 26.9792V27.6536C12.8156 27.5874 12.2917 27.491 11.7918 27.3646V26.9792C11.7918 26.5576 12.1411 26.2083 12.5627 26.2083ZM18.7293 26.2083C19.1027 26.2083 19.4279 26.4793 19.5002 26.8346C19.0003 27.0394 18.4884 27.2261 17.9585 27.3646V26.9792C17.9585 26.5576 18.3078 26.2083 18.7293 26.2083Z" fill="white"/>
                    </svg>
                  </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </>
    );
  }
}

export default App;
