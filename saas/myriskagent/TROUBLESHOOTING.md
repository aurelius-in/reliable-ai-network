# MyRiskAgent Demo - Troubleshooting Guide

## 🚨 Common Issues and Solutions

### Issue: Black Screen or Broken Images
**Symptoms**: 
- Black screen when opening `index.html` directly
- 404 errors for CSS, JS, or image files
- Console errors about failed resource loading

**Cause**: Browser security restrictions prevent ES modules from loading via `file://` protocol

**Solution**: Use the local server instead of opening the file directly
1. Run `serve.bat` (Windows) or `./serve.sh` (Mac/Linux)
2. Or run `python serve.py` manually
3. Open http://localhost:8080 in your browser

### Issue: "Python not found" Error
**Symptoms**: 
- Error message about Python not being installed
- Server scripts fail to run

**Solutions**:
- **Windows**: Download Python from https://www.python.org/downloads/
- **macOS**: `brew install python3` or download from python.org
- **Linux**: `sudo apt install python3` (Ubuntu/Debian) or `sudo yum install python3` (CentOS/RHEL)

### Issue: Port 8080 Already in Use
**Symptoms**: 
- Error about port already being used
- Server fails to start

**Solutions**:
1. **Kill existing process**: 
   - Windows: `netstat -ano | findstr :8080` then `taskkill /PID <PID> /F`
   - Mac/Linux: `lsof -ti:8080 | xargs kill -9`
2. **Use different port**: Run `python serve.py --port 8081`

### Issue: Browser Doesn't Open Automatically
**Symptoms**: 
- Server starts but browser doesn't open
- Need to manually navigate to the URL

**Solution**: 
- Manually open http://localhost:8080 in your browser
- The server will still work fine without auto-opening

### Issue: Demo Shows "Loading..." Forever
**Symptoms**: 
- Splash screen appears but never transitions to main app
- Console shows JavaScript errors

**Solutions**:
1. **Check browser compatibility**: Use Chrome, Firefox, Safari, or Edge (latest versions)
2. **Disable browser extensions**: Some ad blockers or security extensions may interfere
3. **Clear browser cache**: Clear cache and reload the page
4. **Check console**: Open Developer Tools (F12) and look for error messages

### Issue: Assets Not Loading (404 Errors)
**Symptoms**: 
- CSS, JS, or image files return 404 errors
- Partial loading with missing styles or functionality

**Solutions**:
1. **Check file paths**: Ensure all files are in the correct directories
2. **Use local server**: Don't open `index.html` directly - use the server
3. **Check permissions**: Ensure files are readable by the web server
4. **Verify file structure**: Check that `assets/` folder contains all necessary files

## 🔧 Technical Details

### Why a Server is Required
Modern web applications use ES modules which have security restrictions:
- **ES Modules**: Require HTTP(S) protocol, not `file://`
- **CORS Policy**: Browsers block cross-origin requests for security
- **Local Development**: A local server provides the proper protocol

### Supported Browsers
- **Chrome**: 61+ (recommended)
- **Firefox**: 60+
- **Safari**: 10.1+
- **Edge**: 79+

### File Structure Requirements
```
docs/demo/
├── index.html              # Main HTML file
├── assets/                 # CSS, JS, and images
│   ├── index-BuzX7yT1.js   # Main JavaScript bundle
│   ├── index-C97P5uUK.css  # Main CSS bundle
│   └── mra-*.png/gif/webp  # Logo and banner images
├── serve.py               # Python server script
├── serve.bat              # Windows batch file
├── serve.sh               # Unix shell script
└── architecture/          # Documentation
```

## 🆘 Still Having Issues?

### Debug Steps
1. **Check browser console**: Press F12 and look for error messages
2. **Verify server is running**: Check that http://localhost:8080 responds
3. **Check file permissions**: Ensure all files are readable
4. **Try different browser**: Test with Chrome, Firefox, or Safari
5. **Restart server**: Stop and restart the Python server

### Alternative Solutions
If the Python server doesn't work, try these alternatives:

**Node.js Server**:
```bash
npx http-server -p 8080 -c-1
```

**PHP Server** (if PHP is installed):
```bash
php -S localhost:8080
```

**Python 2 Server** (if Python 3 isn't available):
```bash
python -m SimpleHTTPServer 8080
```

### Getting Help
If you continue to have issues:
1. **Check the console**: Look for specific error messages
2. **Try a different browser**: Some browsers have different security policies
3. **Use the source code**: The `src/` folder contains the original React components
4. **Contact support**: For persistent issues, contact the development team

---

**Remember**: The demo is designed to work with a local web server, not by opening the HTML file directly. This is standard practice for modern web applications.
