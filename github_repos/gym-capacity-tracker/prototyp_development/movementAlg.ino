// This initial program determines wether an object is approaching
// or travleing further away from the sensor. Doesn't account
// for any edge cases, very basic initial test.
// Serial prints were left in for data and array analysis.

/*               
              *****************************
              *  Variables and Functions  *
              *****************************
*/

//Consant variables
const int pwPinIN = 7;
const int pwPinOUT = 6;
const double DESCEND = 0.0;
const double ASCEND = 1.0;
//variables needed to store values
int totalPeople;
long pulse, inches;
bool checkForMoveIN, checkForMoveOUT;
double bigSwaps, numSame; 
double checkArray[4];
double distArr[20];

// *************** FUNCTIONS ****************

// Function that determines if too many swaps are made
// @param 1 = number of swaps, from sort alg
// @param 2 = size of array being sorted
// @return = false if large number of swaps are made, true if small
bool checkNumSwaps(double numSwaps, double numSame, double arrSize) {
  if(arrSize == 4) {
    if(numSwaps/arrSize > 0.33 || numSame > 2)
       return false;
    else
       return true;
  }
  else {
    if(numSwaps/arrSize > 0.4 || numSame > 7)
       return false;
    else
       return true;
  }
}

// Sorting function, different types of sorts, keeps track 
// of switches.
// @param1 = array of data points (distsances) from sensor
// @param2 = array size
// @param3 = type of sort (desc, asc, etc)
// @return = true/false, entering/leaving or not
bool sortArray(double distArr[], double arrSize, int type) {
  bigSwaps = 0;
  numSame = 0;
  if(type == DESCEND) {
    bool needSwap;
    for(int i = 1; i < arrSize; i++) {
      needSwap = false;
      int j = i;
      int temp;
      while((j > 0) && (distArr[j] > distArr[j-1])) {
        if(arrSize != 4) {
          if((distArr[j] - distArr[j-1]) > 5) {
            needSwap = true;
          }
          temp = distArr[j];
          distArr[j] = distArr[j-1];
          distArr[j-1] = temp;
          j = j - 1;
        }
        else {
          temp = distArr[j];
          distArr[j] = distArr[j-1];
          distArr[j-1] = temp;
          j = j - 1;
          needSwap = true;
        }
      }
      if(needSwap == true) {
        bigSwaps++;
      }
    }
    for(int j = 1; j < arrSize; j++) {
      if(distArr[j] == distArr[j-1])
        numSame++;
    }
  }
  return checkNumSwaps(bigSwaps, numSame, arrSize);
}

// Checks small # of data points for potential movement
// @param = pin number (one for each sensor)
// @return = yes potential move or no potential move
bool checkForMove(int pwPin) {
  int numAbove92 = 0;
  for(int i = 0; i < 4; i++) {
    pulse = pulseIn(pwPin, HIGH);
    inches = pulse/147;
    // Limit data to be within 91" range, anything higher has been
    // found to be very noisy and not related to actual distance
    if(inches < 92) {
      checkArray[i] = inches;
    }
    else { // Decrease i so algorithm re-checks and adds at same index
      i--;
      numAbove92++;
      if(numAbove92 == 2) {
        return false;
      }
    }
    delay(85);
  }
  bool testResult = sortArray(checkArray, 4, DESCEND);
  return testResult;
}

// Check many data points at small intervals for movement
// @param = pin number (1 for each sensor)
// @return = yes person walking, no person walking
bool checkMove(int pwPin) {
    int numAbove92 = 0;
    for(int i = 0; i < 20; i++) {
      pulse = pulseIn(pwPin, HIGH);
      inches = pulse/147;
    
      if(inches < 92) {
        distArr[i] = inches;
      }
      else {
        i--;
        numAbove92++;
  
        if(numAbove92 == 3) {
          return false;
        }
      }
      delay(75);
    }
    // reset number of same distances for different array
    numSame = 0;
    bool result = sortArray(distArr, 20, DESCEND);
    return result;
}
void incrNumPeople(bool result, int pwPin) {
    if(result && (pwPin == pwPinIN)) {
      totalPeople++;
    }
    else if(result && (pwPin == pwPinOUT)) {
      totalPeople--;
      Serial.print("Num of people: ");
      Serial.println(totalPeople);
    }
    else
      Serial.println("No move was detected");
}

/*               
                 ***********************
                 *   SETUP AND LOOP    *
                 ***********************
*/

// initialize serial monitor for debugging, pinmode, and total people
void setup() {
  Serial.begin(9600);
  pinMode(pwPinIN, INPUT);
  pinMode(pwPinOUT, INPUT);
  totalPeople = 0;
}
// Check for potential move (small # of decreasing distances)
// If potential move, check for move (high # of decreasing distances)
// If move, increase people by 1
void loop() {
  bigSwaps = 0;
  numSame = 0;
  
  checkForMoveIN = checkForMove(pwPinIN);
  if(checkForMoveIN == true) {
    bigSwaps = 0;
    numSame = 0;
    Serial.println("Potential move in, checking...");
    bool moveOrNah = checkMove(pwPinIN);
    incrNumPeople(moveOrNah, pwPinIN);
  } 
  
  delay(25);
  
  checkForMoveOUT = checkForMove(pwPinOUT);
  if(checkForMoveOUT == true) {
    bigSwaps = 0;
    numSame = 0;
    Serial.println("Potential move out, checking...");
    bool moveOrNah = checkMove(pwPinOUT);
    incrNumPeople(moveOrNah, pwPinOUT);
  }

  delay(25);
}

