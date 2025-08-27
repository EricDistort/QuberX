{/* Replace the current Balance Section in your HomeScreen with this */}
<View style={styles.secondContainerWrapper}>
  <LottieView
    source={require('../homeMedia/balanceanimation.json')}
    style={[styles.secondContainer, { opacity: 0.7 }]}
    autoPlay
    loop
  />
  <View style={styles.balanceOverlay}>
    <Text style={styles.balanceSubHeader}>Current Balance</Text>
    <Text style={styles.balanceAmount}>₹{user?.balance || '0'}</Text>

    {/* Four horizontal image buttons */}
    <View style={styles.fourButtonRow}>
      {[
        {
          name: 'Send',
          icon: require('../homeMedia/send.webp'),
          onPress: () => navigation.navigate('HomeDetails'),
        },
        {
          name: 'Receive',
          icon: require('../homeMedia/recieve.webp'),
          onPress: () => navigation.navigate('HomeRecieve'),
        },
        {
          name: 'Deposit',
          icon: require('../homeMedia/deposit.webp'),
          onPress: () => navigation.navigate('DepositScreen'),
        },
        {
          name: 'History',
          icon: require('../homeMedia/withdraw.webp'),
          onPress: () => navigation.navigate('TransactionList'),
        },
      ].map((btn, index) => (
        <TouchableOpacity
          key={index}
          style={styles.imageButton}
          onPress={btn.onPress}
        >
          <Image source={btn.icon} style={styles.buttonIcon} />
          <Text style={styles.buttonLabel}>{btn.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
</View>
