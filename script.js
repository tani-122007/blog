let blogs = JSON.parse(localStorage.getItem('blogs')) || [
  {id:1,title:"Getting Started with React in 2024",cat:"TECH",author:"Alex Morgan",views:2100,likes:120,date:"Dec 12, 2024",img:"https://images.unsplash.com/photo-1555066931-4365d14bab8c",content:"A complete guide to building modern React apps with best practices."},
  {id:2,title:"10 Hidden Gems to Explore in Southeast Asia",cat:"TRAVEL",author:"Sara Kim",views:1800,likes:95,date:"Dec 10, 2024",img:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4",content:"Discover off-the-beaten-path destinations that will make your trip unforgettable."},
  {id:3,title:"Healthy Meal Prep for Busy Weekdays",cat:"FOOD",author:"Marcus Lee",views:1400,likes:78,date:"Dec 9, 2024",img:"https://images.unsplash.com/photo-1540420773420-3366772f4999",content:"Simple, nutritious meal prep ideas to save time and stay healthy."}
];
let curCat="ALL", editId=null;

const hexCanvas=document.getElementById('hexBackground');
const hexContext=hexCanvas.getContext('2d');
const hexLight={x:innerWidth/2,y:innerHeight/2,targetX:innerWidth/2,targetY:innerHeight/2,active:false};
const hexTrail=[];
let hexFrame=0;
const hexRadius=38;

function resizeHexBackground(){
  const pixelRatio=Math.min(window.devicePixelRatio||1,1.5);
  hexCanvas.width=Math.round(innerWidth*pixelRatio);
  hexCanvas.height=Math.round(innerHeight*pixelRatio);
  hexContext.setTransform(pixelRatio,0,0,pixelRatio,0,0);
  drawHexBackground();
}

function drawHexBackground(){
  const width=innerWidth,height=innerHeight,now=performance.now();
  hexContext.clearRect(0,0,width,height);
  const lightX=hexLight.x,lightY=hexLight.y;
  const glow=hexContext.createRadialGradient(lightX,lightY,0,lightX,lightY,230);
  glow.addColorStop(0,'rgba(37,99,235,.10)');
  glow.addColorStop(.55,'rgba(228,64,95,.035)');
  glow.addColorStop(1,'rgba(37,99,235,0)');
  if(hexLight.active){
    hexContext.fillStyle=glow;
    hexContext.fillRect(0,0,width,height);
  }

  const columnStep=hexRadius*1.5;
  const rowStep=hexRadius*Math.sqrt(3);
  for(let column=-1,x=-hexRadius; x<width+hexRadius; column++,x+=columnStep){
    const offset=(column&1)?rowStep/2:0;
    for(let y=-rowStep; y<height+rowStep; y+=rowStep){
      let strength=0;
      if(hexLight.active){
        const dx=x-lightX,dy=y+offset-lightY;
        strength=Math.exp(-(dx*dx+dy*dy)/(2*145*145));
        for(let i=hexTrail.length-1;i>=0;i--){
          const point=hexTrail[i],age=now-point.time;
          if(age>1100){hexTrail.splice(i,1);continue}
          const tx=x-point.x,ty=y+offset-point.y;
          strength=Math.max(strength,Math.exp(-(tx*tx+ty*ty)/(2*100*100))*(1-age/1100)*.62);
        }
      }
      hexContext.beginPath();
      for(let side=0;side<6;side++){
        const angle=(Math.PI/180)*(60*side+30);
        const px=x+hexRadius*Math.cos(angle);
        const py=y+offset+hexRadius*Math.sin(angle);
        if(side===0)hexContext.moveTo(px,py);else hexContext.lineTo(px,py);
      }
      hexContext.closePath();
      hexContext.lineWidth=.8+strength*1.25;
      hexContext.strokeStyle=`rgba(55,83,140,${.10+strength*.48})`;
      if(strength>.18){
        hexContext.shadowColor=`rgba(37,99,235,${strength*.55})`;
        hexContext.shadowBlur=strength*13;
      }else{
        hexContext.shadowBlur=0;
      }
      hexContext.stroke();
    }
  }
  hexContext.shadowBlur=0;
}

function animateHexBackground(){
  hexFrame=0;
  hexLight.x+=(hexLight.targetX-hexLight.x)*.18;
  hexLight.y+=(hexLight.targetY-hexLight.y)*.18;
  drawHexBackground();
  const isMoving=Math.abs(hexLight.targetX-hexLight.x)+Math.abs(hexLight.targetY-hexLight.y)>.5;
  if(isMoving||hexTrail.length)hexFrame=requestAnimationFrame(animateHexBackground);
}

function moveHexLight(event){
  hexLight.active=true;
  hexLight.targetX=event.clientX;
  hexLight.targetY=event.clientY;
  const now=performance.now();
  hexTrail.push({x:event.clientX,y:event.clientY,time:now});
  if(hexTrail.length>18)hexTrail.shift();
  if(!hexFrame)hexFrame=requestAnimationFrame(animateHexBackground);
}

window.addEventListener('resize',resizeHexBackground);
window.addEventListener('pointermove',moveHexLight,{passive:true});
resizeHexBackground();

const loginForm=document.getElementById('loginForm');
const loginScreen=document.getElementById('loginScreen');
const app=document.getElementById('app');
const loginEmail=document.getElementById('loginEmail');
const savedEmail=sessionStorage.getItem('bloghubUser');

function showApp(){
  loginScreen.hidden=true;
  app.hidden=false;
  renderBlogs();
}

function logout(){
  sessionStorage.removeItem('bloghubUser');
  location.reload();
}

loginForm.addEventListener('submit',event=>{
  event.preventDefault();
  const email=loginEmail.value.trim();
  sessionStorage.setItem('bloghubUser',email);
  showApp();
});

function saveLocal(){localStorage.setItem('blogs',JSON.stringify(blogs))}
function setCat(c){curCat=c;document.querySelectorAll('.filter-bar button').forEach(b=>b.classList.toggle('active',b.textContent==c||(c=='ALL'&&b.textContent=='All')));renderBlogs()}

function renderBlogs(){
  const q=document.getElementById('search').value.toLowerCase();
  const list=document.getElementById('blogs'); list.innerHTML="";
  let filtered=blogs.filter(b=>(curCat=='ALL'||b.cat==curCat)&&(b.title.toLowerCase().includes(q)||b.cat.toLowerCase().includes(q)));
  document.getElementById('totalCount').textContent=blogs.length;
  document.getElementById('totalViews').textContent=blogs.reduce((s,b)=>s+b.views,0);
  filtered.forEach(b=>{
    list.innerHTML+=`<div class="card">
      <img src="${b.img}"><div class="card-body">
      <span class="tag ${b.cat}">${b.cat}</span>
      <h3 onclick="viewBlog(${b.id})">${b.title}</h3>
      <p style="font-size:13px;color:#666">${b.content.slice(0,80)}...</p>
      <div class="meta"><span>${b.author} • ${b.date}</span><span>👁 ${b.views} ❤ ${b.likes}</span></div>
      <div class="actions"><button onclick="editBlog(${b.id})">Edit</button><button onclick="deleteBlog(${b.id})">Delete</button><button onclick="likeBlog(${b.id})">Like</button></div>
      </div></div>`;
  });
  document.getElementById('popular').innerHTML=blogs.sort((a,b)=>b.views-a.views).slice(0,3).map(b=>`<p style="margin:10px 0;font-size:14px"><b>${b.title}</b><br><small>${b.views} views</small></p>`).join('');
}

function openModal(){document.getElementById('modal').style.display='flex'}
function closeModal(){document.getElementById('modal').style.display='none';editId=null;['bTitle','bCat','bImg','bAuthor','bContent'].forEach(id=>document.getElementById(id).value='');document.getElementById('modalTitle').textContent='Create New Blog'}
function saveBlog(){
  const data={title:bTitle.value,cat:bCat.value,img:bImg.value||'https://images.unsplash.com/photo-1499750310107-5fef28a66643',author:bAuthor.value||'Anonymous',content:bContent.value,date:new Date().toLocaleDateString(),views:Math.floor(Math.random()*100),likes:0};
  if(!data.title||!data.content) return alert('Title & Content required');
  if(editId){let i=blogs.findIndex(b=>b.id==editId);blogs[i]={...blogs[i],...data}} else {data.id=Date.now();blogs.unshift(data)}
  saveLocal();renderBlogs();closeModal();
}
function editBlog(id){let b=blogs.find(x=>x.id==id);editId=id;bTitle.value=b.title;bCat.value=b.cat;bImg.value=b.img;bAuthor.value=b.author;bContent.value=b.content;document.getElementById('modalTitle').textContent='Edit Blog';openModal()}
function deleteBlog(id){if(confirm('Delete this blog?')){blogs=blogs.filter(b=>b.id!=id);saveLocal();renderBlogs()}}
function likeBlog(id){let b=blogs.find(x=>x.id==id);b.likes++;saveLocal();renderBlogs()}
function viewBlog(id){let b=blogs.find(x=>x.id==id);b.views++;saveLocal();renderBlogs();alert(b.title+"\n\n"+b.content)}
function showDashboard(){document.getElementById('hero').innerHTML=`<h1>Dashboard</h1><p>You have ${blogs.length} blogs. Total views: ${blogs.reduce((s,b)=>s+b.views,0)}</p>`;setCat('ALL')}
function showHome(){location.reload()}

if(savedEmail){
  showApp();
}