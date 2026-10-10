# HexoBlog

cmd 
···
      - name: Install dependencies
        run: npm install

      - name: Clean and Build
        run: |
          npx hexo clean
          npm run build
···

https://homleening.github.io/