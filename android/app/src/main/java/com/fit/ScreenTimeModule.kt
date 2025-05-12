package com.fit

import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Callback

class ScreenTimeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    // This method will be called from JavaScript
    override fun getName(): String {
        return "ScreenTimeModule"
    }

    // Define the method that you want to call from JavaScript
    @ReactMethod
    fun getScreenTime(callback: Callback) {
        try {
            // Replace with actual logic to get screen time
            val screenTime = "2 hours"  // Example, replace with real screen time logic
            callback.invoke(null, screenTime)  // Pass the result to JavaScript
        } catch (e: Exception) {
            callback.invoke(e.message, null)  // In case of error, send error message
        }
    }
}
