import express from 'express';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, child, update, push  } from 'firebase/database';
const app = express();
const PORT = process.env.PORT || 3000;

// Firebase 配置
const firebaseConfig = {
    apiKey: "AIzaSyBv5UlN_6wbxZBLZcP13UcwM6unIixKn6I",
    authDomain: "vue-http-demo-8773a.firebaseapp.com",
    databaseURL: "https://vue-http-demo-8773a-default-rtdb.firebaseio.com",
    projectId: "vue-http-demo-8773a",
    storageBucket: "vue-http-demo-8773a.appspot.com",
    messagingSenderId: "189657556660",
    appId: "1:189657556660:web:4650bcc6ad7106bdcc59e1",
  };
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);


// 解析 JSON 主體
app.use(express.json());


// 路由範例：取得 Realtime Database 中的資料
app.get('/data', async (req, res) => {
try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, 'users')); // 設定資料的路徑
    if (snapshot.exists()) {
    res.json(snapshot.val());
    } else {
    res.status(404).send("No data available");
    }
} catch (error) {
    res.status(500).send(`Error fetching data: ${error.message}`);
}
});

// 路由範例：更新指定寵物的名稱
app.post('/update-pet-name', async (req, res) => {
  const { petId, newPetName } = req.body;

  if (!petId || !newPetName) {
    return res.status(400).send("Please provide both petId and newPetName.");
  }

  try {
    // get pet
    const thePet = ref(db, `/users/${petId}`);
    
    // show the pet
    const petSnapshot = await get(thePet);
    if (!petSnapshot.exists()) {
      return res.status(404).send("Pet not found");
    }
    console.log(petSnapshot.val());
    
    // update pet name
    let petData = petSnapshot.val();
    petData.petName = newPetName;

    // update pet level -5
    petData.petLevel -= 5;
    console.log(petData);
    await update(thePet, petData);

    res.status(200).send(`Pet name updated to ${newPetName}`);
  } catch (error) {
    res.status(500).send(`Error updating pet name: ${error.message}`);
  }
});


// 新增任務的路由
app.post('/add-task', async (req, res) => {
    const { petId, taskDescription } = req.body;
  
    if (!petId || !taskDescription) {
      return res.status(400).send("Please provide both petId and taskDescription.");
    }
  
    try {
      const tasksRef = ref(db, `users/${petId}/tasks`); // 指向 petId 路徑下的 tasks
      const newTask = {
        description: taskDescription,
        status: "not started"
      };
  
      // 將新任務推送到 Firebase
      await push(tasksRef, newTask);
      res.status(200).send(`Task added: ${taskDescription}`);
    } catch (error) {
      res.status(500).send(`Error adding task: ${error.message}`);
    }
  });
  

// 啟動伺服器
app.listen(PORT, () => {
console.log(`Server is running on http://localhost:${PORT}`);
});
