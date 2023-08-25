# taicol-web-2022
This is repository for [TaiCOL web](taicol.tw).

## Installing Django
1. copy `dotenv.example` file and rename it to `.env`
2. build react frontend
```
npm install webpack
npm run build 
```

> **Note** will generate `bundle.js` in `./static/react_component/` 


4. start django & react frontend service
```
docker-compose build
docker-compose up -d
```


## Installing React
1. run `cd /path/to/taicol-web-2022/react-backend/app/`
2. copy `dotenv.example` file and rename it to `.env`
3. build react backend
```
npm install
npm run build
```
> **Note** will generate `.next` folder
4. start react backend service
```
cd /path/to/taicol-web-2022/react-backend
docker-compose up -d
```
> **Note** when rebuilding react-backend docker container, remember to backup mysql data first

5. create symbolic link
```
ln -t /path/to/tc-web-volumes/static -s /path/to/taicol-web-2022/react-backend/app/public/upload
```
6. grant folder access permission to your user
```
sudo chown [your_user] /path/to/taicol-web-2022/react-backend/app/public/upload
```

## Stopping service
> **Note** remember to unlink symbolic link

```
docker-compose down
cd /path/to/taicol-web-2022/react-backend
docker-compose down
cd /path/to/tc-web-volumes/static
unlink upload
```

## Nginx settings in production mode

Use Amazon linux 2 as example

1. install and start nginx
```
sudo amazon-linux-extras install nginx1
sudo systemctl start nginx
```
2. copy `reverse_proxy-prod.conf` to `/etc/nginx/conf.d/`
3. grant folder access permission to nignx
```
sudo usermod -a -G [your_user] nginx
chmod 710 /home/[your_user]
```
4. restart nginx to make changes take effect
```
sudo systemctl restart nginx
```
5. set https with certbot
```
sudo amazon-linux-extras install epel
sudo yum install certbot-nginx
sudo certbot --nginx
```
