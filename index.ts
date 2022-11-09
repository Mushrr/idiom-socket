import Cloud from "./src/Cloud";

const cloud = new Cloud({
    port: 3000
});



cloud.listen(3000);