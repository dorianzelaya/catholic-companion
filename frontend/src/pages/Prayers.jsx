import { useState, useEffect } from 'react'
import BackButton from '../components/BackButton'

const PRAYERS = {
  "Daily Prayers": [
    {
      name: "Sign of the Cross",
      text: "In the name of the Father, and of the Son, and of the Holy Spirit. Amen.",
      image: "/prayer-cards/sign-of-cross.jpg",
      caption: "Christ on the Cross — El Greco, c. 1600–1610",
      history: "One of the oldest gestures in Christianity, dating back to at least the 2nd century. Tertullian wrote in 200 AD that Christians marked their foreheads with the cross in all daily actions. The trinitarian formula 'Father, Son, and Holy Spirit' comes directly from Matthew 28:19. It is both a profession of faith and a sacramental blessing."
    },
    {
      name: "Glory Be",
      text: "Glory be to the Father and to the Son and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.",
      image: "/prayer-cards/glory-be.jpg",
      caption: "The Holy Trinity — Antonio de Pereda, c. 1659",
      history: "Also called the Lesser Doxology, this short prayer of praise dates to the early Church. It was used in the Divine Office by the 4th century and was standardized in its current form by the Council of Nicaea (325 AD). It is prayed at the end of each decade of the Rosary and after every psalm in the Liturgy of the Hours."
    },
    {
      name: "Our Father",
      text: "Our Father, who art in Heaven, hallowed be Thy name. Thy kingdom come, Thy will be done on earth as it is in Heaven. Give us this day our daily bread, and forgive us our trespasses as we forgive those who trespass against us. And lead us not into temptation, but deliver us from evil. Amen.",
      image: "/prayer-cards/our-father.jpg",
      caption: "The Lord's Prayer — James Tissot, c. 1886–1894",
      history: "Given directly by Jesus Christ when his disciples asked him how to pray (Matthew 6:9–13 and Luke 11:2–4). It is the fundamental Christian prayer and has held a central place in the Eucharistic liturgy since the early centuries of the Church. St. Thomas Aquinas called it 'the most perfect of prayers,' while St. Augustine taught that every prayer found in Scripture is contained within it."
    },
    {
      name: "Hail Mary",
      text: "Hail Mary, full of grace, the Lord is with Thee. Blessed art thou amongst women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",
      image: "/prayer-cards/hail-mary.jpg",
      caption: "Sistine Madonna — Raphael, c. 1513–1514",
      history: "Composed from two scriptural greetings — the Angel Gabriel's words to Mary (Luke 1:28) and Elizabeth's greeting at the Visitation (Luke 1:42). The petition 'Holy Mary, Mother of God, pray for us sinners…' developed during the Middle Ages, and the prayer's present form was officially included in the Roman Breviary in 1568. It is the principal repeated prayer of the Rosary."
    },
    {
      name: "Morning Offering",
      text: "My God, I thank you for protecting me through the night. I praise you and give you thanks for all the blessings you have bestowed on me. In union with Jesus, I consecrate to you all my thoughts, words, actions, joys, and sufferings of this day. Mary, my mother, bless me this day and protect me from dangers. My Guardian Angel and all my patrons, pray for me. Amen.",
      image: "/prayer-cards/morning-offering.jpg",
      caption: "Sacred Heart of Jesus — Pompeo Batoni, 1767",
      history: "This form of the Morning Offering was promoted by the Apostleship of Prayer, founded by Father François Gautrelet SJ in France in 1844. The prayer unites the day's joys and sufferings with the intentions of the Sacred Heart of Jesus, making ordinary daily life an act of prayer."
    },
    {
      name: "Night Prayer",
      text: "Lord Jesus Christ, you have given your followers an example of gentleness and humility, a task that is easy, a burden that is light. Accept the prayers and work of this day, and give us the rest that will strengthen us to render more faithful service to you who live and reign forever and ever. Amen.",
      image: "/prayer-cards/night-prayer.jpg",
      caption: "Christ in Gethsemane — Heinrich Hofmann, 1886",
      history: "Drawn from the ancient tradition of Compline, the final prayer of the Church's daily Liturgy of the Hours. Monks and religious have prayed night prayers since the Rule of Saint Benedict (6th century). This form reflects the gentle, humble spirit of Christ that Benedict called his monks to imitate."
    },
    {
      name: "Guardian Angel Prayer",
      text: "Angel of God, my guardian dear, to whom God's love commits me here. Ever this day be at my side, to light and guard, to rule and guide. Amen.",
      image: "/prayer-cards/guardian-angel.jpg",
      caption: "The Guardian Angel — Gioacchino Assereto, c. 1630",
      history: "Belief in personal guardian angels is ancient and rooted in Scripture (Matthew 18:10; Psalm 91:11). This particular prayer developed during the medieval period and is often among the first prayers taught to Catholic children. The Memorial of the Holy Guardian Angels is celebrated on October 2."
    },
    {
      name: "Grace Before Meals",
      text: "Bless us, O Lord, in these your gifts, which we are about to receive from your bounty through Christ our Lord. Amen.",
      image: "/prayer-cards/grace-before-meals.jpg",
      caption: "The Wedding at Cana — Garofalo (Benvenuto Tisi), 1531",
      history: "The practice of blessing God before eating is rooted in Jewish tradition and was continued by the earliest Christians. Saint Paul is described as giving thanks before eating in Acts 27:35. The familiar Catholic formula, 'Bless us, O Lord…,' developed within the Church's Latin prayer tradition and became a customary blessing in Catholic homes and communities."
    },
    {
      name: "Grace After Meals",
      text: "We give you thanks, O Almighty God, for these your benefits, who lives and reigns, world without end. Amen.",
      image: "/prayer-cards/grace-after-meals.jpg",
      history: "The companion to Grace Before Meals, this prayer of thanksgiving after eating echoes Deuteronomy 8:10 — 'When you have eaten and are satisfied, praise the Lord your God.' The practice of blessing God after meals is one of the oldest forms of Jewish and Christian prayer."
    },
  ],
  "Creeds": [
    {
      name: "Apostles' Creed",
      text: "I believe in God, the Father almighty, Creator of heaven and earth, and in Jesus Christ, his only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried. He descended into hell. On the third day he rose again from the dead. He ascended into heaven, and is seated at the right hand of God the Father almighty. From there he will come to judge the living and the dead. I believe in the Holy Spirit, the holy Catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.",
      image: "/prayer-cards/apostles-creed.jpg",
      caption: "The Forerunners of Christ with Saints and Martyrs — Fra Angelico, c. 1423–1424",
      history: "Though not written directly by the Apostles, this creed faithfully summarizes the apostolic faith. It developed from the ancient baptismal creed of the Church at Rome, whose roots reach back to the early centuries, and reached approximately its present form by the eighth century. It is used in Baptism, the Rosary, and, as an alternative to the Nicene Creed, at certain Masses."
    },
    {
      name: "Nicene Creed",
      text: "I believe in one God, the Father almighty, maker of heaven and earth, of all things visible and invisible. I believe in one Lord Jesus Christ, the Only Begotten Son of God, born of the Father before all ages. God from God, Light from Light, true God from true God, begotten, not made, consubstantial with the Father; through him all things were made. For us men and for our salvation he came down from heaven, and by the Holy Spirit was incarnate of the Virgin Mary, and became man. For our sake he was crucified under Pontius Pilate, he suffered death and was buried, and rose again on the third day in accordance with the Scriptures. He ascended into heaven and is seated at the right hand of the Father. He will come again in glory to judge the living and the dead and his kingdom will have no end. I believe in the Holy Spirit, the Lord, the giver of life, who proceeds from the Father and the Son, who with the Father and the Son is adored and glorified, who has spoken through the prophets. I believe in one, holy, catholic and apostolic Church. I confess one Baptism for the forgiveness of sins and I look forward to the resurrection of the dead and the life of the world to come. Amen.",
      image: "/prayer-cards/nicene-creed.jpg",
      caption: "First Council of Nicaea — Michael Damaskinos, 1591",
      history: "First formulated at the Council of Nicaea in AD 325 to affirm the full divinity of Christ against Arianism, it was developed further at the First Council of Constantinople in AD 381. It is the most widely shared creed among Catholic, Orthodox, and historic Protestant Christians, although differences exist in its wording and use. In the Roman Rite it is normally proclaimed at Mass on Sundays and solemnities, with the Apostles' Creed permitted as an alternative in certain circumstances."
    },
  ],
  "Marian Prayers": [
    {
      name: "Hail Holy Queen",
      text: "Hail, holy Queen, mother of mercy, our life, our sweetness, and our hope. To thee we cry, poor banished children of Eve. To thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us, and after this our exile show us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary. Pray for us, O Holy Mother of God, that we may be made worthy of the promises of Christ. Amen.",
      image: "/prayer-cards/hail-holy-queen.jpg",
      caption: "The Coronation of the Virgin — Diego Velázquez, c. 1635–1636",
      history: "Composed during the Middle Ages, probably in the eleventh century, this Marian antiphon is traditionally attributed to figures including Hermann of Reichenau, although its actual author is unknown. It became part of the Church's liturgical tradition as one of the Marian antiphons and is traditionally prayed at the conclusion of the Rosary."
    },
    {
      name: "Memorare",
      text: "Remember, O most gracious Virgin Mary, that never was it known that anyone who fled to thy protection, implored thy help, or sought thine intercession was left unaided. Inspired by this confidence, I fly to thee, O Virgin of virgins, my mother. To thee do I come, before thee I stand, sinful and sorrowful. O Mother of the Word Incarnate, despise not my petitions, but in thy mercy hear and answer me. Amen.",
      image: "/prayer-cards/memorare.jpg",
      caption: "The Crowning of the Virgin (Oddi Altarpiece) — Raphael, c. 1502–1504",
      history: "Derived from a longer Marian prayer dating to the fifteenth century, the Memorare was popularized in seventeenth-century France by Father Claude Bernard. It is frequently misattributed to Saint Bernard of Clairvaux. Its title comes from the Latin word memorare, meaning 'remember,' and it remains one of the Church's most beloved prayers for Mary's intercession."
    },
    {
      name: "Magnificat",
      text: "My soul proclaims the greatness of the Lord, my spirit rejoices in God my Savior, for he has looked with favor on his lowly servant. From this day all generations will call me blessed: the Almighty has done great things for me, and holy is his Name. He has mercy on those who fear him in every generation. He has shown the strength of his arm, he has scattered the proud in their conceit. He has cast down the mighty from their thrones, and has lifted up the lowly. He has filled the hungry with good things, and the rich he has sent away empty. He has come to the help of his servant Israel, for he has remembered his promise of mercy, the promise he made to our fathers, to Abraham and his children forever.",
      image: "/prayer-cards/magnificat.jpg",
      caption: "The Annunciation — Fra Angelico, c. 1426",
      history: "Mary's own canticle, recorded in Luke 1:46–55, was spoken during her visit to her relative Elizabeth while pregnant with Jesus. It draws heavily upon Hannah's prayer in 1 Samuel 2:1–10. The Church has prayed the Magnificat daily at Evening Prayer, or Vespers, since ancient times, making it one of the most frequently prayed canticles in Christian history."
    },
  ],
  "Acts": [
    {
      name: "Act of Contrition",
      text: "O My God, I am heartily sorry for having offended you, and I detest all my sins, because of your just punishments, but most of all, because they offend you, my God, who are all good and deserving of all my love. I firmly resolve, with the help of your grace, to sin no more, and to avoid the near occasions of sin. Amen.",
      image: "/prayer-cards/act-of-contrition.jpg",
      caption: "The Return of the Prodigal Son — Rembrandt, 1669",
      history: "An Act of Contrition expresses sorrow for sin and the resolution to amend one's life. Many forms have developed throughout Catholic history, including traditional and modern versions. During the Sacrament of Confession, the penitent ordinarily makes an Act of Contrition before receiving absolution. It is also commonly taught to children preparing for First Confession."
    },
    {
      name: "Act of Faith",
      text: "O my God, I firmly believe that you are one God in three divine Persons, Father, Son and Holy Spirit. I believe that your divine Son became flesh, died for our sins, and that he will come to judge the living and the dead. I believe these and all the truths that the Holy Catholic Church teaches because you have revealed them, who can neither deceive nor be deceived. Amen.",
      image: "/prayer-cards/act-of-faith.jpg",
      caption: "The Incredulity of Saint Thomas — Caravaggio, c. 1601–1602",
      history: "One of the traditional prayers corresponding to the three theological virtues, this prayer affirms belief in God and in the truths he has revealed through Christ and his Church. The virtues of faith, hope, and charity are rooted in Scripture and were explained systematically by theologians such as Saint Thomas Aquinas. Fixed devotional formulas for these acts became common in later Catholic prayer books and catechesis."
    },
    {
      name: "Act of Hope",
      text: "O my God, relying on your almighty power, infinite mercy and promises, I hope to obtain pardon for my sins, the help of your grace, and life everlasting through the merits of Jesus Christ, my Lord and Redeemer. Amen.",
      image: "/prayer-cards/act-of-hope.jpg",
      caption: "The Resurrection of Christ — Titian, c. 1542–1544",
      history: "The second of the traditional prayers corresponding to the theological virtues, it expresses trust in God's mercy, promises, and saving grace. Rooted in passages such as Romans 5:1–5 and Hebrews 10:23, it places the believer's hope in God and in the merits of Jesus Christ, through whose grace eternal life is promised."
    },
    {
      name: "Act of Love",
      text: "O my God, I love you above all things, with my whole heart and soul, because you are all good and worthy of all love. I love my neighbor as myself for the love of you. I forgive all who have injured me and ask pardon of all whom I have injured. Amen.",
      image: "/prayer-cards/act-of-love.jpg",
      caption: "The Good Samaritan — Eugène Delacroix, 1849",
      history: "The third theological virtue prayer, fulfilling the Great Commandment (Matthew 22:37-39) in prayer form. Saint Thomas Aquinas taught that charity is the greatest of the virtues and the form of all virtues. This prayer expresses love of God above all things and love of neighbor as its necessary consequence."
    },
  ],
  "To the Holy Spirit": [
    {
      name: "Prayer to the Holy Spirit",
      text: "Breathe into me, Spirit of God, that I may think what is holy. Drive me, Spirit of God, that I may do what is holy. Draw me, Spirit of God, that I may love what is holy. Strengthen me, Spirit of God, that I may preserve what is holy. Guide me, Spirit of God, that I may never lose what is holy. Amen.",
      image: "/prayer-cards/holy-spirit.jpg",
      caption: "The Pentecost — El Greco, c. 1600",
      history: "Traditionally attributed to Saint Augustine of Hippo, although its authorship is uncertain, this prayer uses a meditative series of petitions asking the Holy Spirit to dwell within the believer, guide thoughts and actions, inspire love, give strength, and lead the soul toward holiness."
    },
    {
      name: "Come, Holy Spirit",
      text: "Come, Holy Spirit, fill the hearts of your faithful and enkindle in them the fire of your love. Send forth your Spirit and they shall be created, and you shall renew the face of the earth. O God, who has instructed the hearts of your faithful by the light of the Holy Spirit, grant that by the same Holy Spirit we may have a right judgment in all things and evermore rejoice in his consolations. Through Christ Our Lord. Amen.",
      image: "/prayer-cards/come-holy-spirit.jpg",
      caption: "Pentecost — Jean Restout, 1732",
      history: "Known in Latin as Veni Sancte Spiritus, this medieval sequence is traditionally attributed to Pope Innocent III or Archbishop Stephen Langton and dates to around the late twelfth or early thirteenth century. It is sung or recited at Mass on Pentecost. It should not be confused with the ninth-century hymn Veni Creator Spiritus, which is traditionally sung at ordinations, councils, and other important Church gatherings."
    },
    {
      name: "Fatima Prayer",
      text: "O my Jesus, forgive us our sins, save us from the fire of hell, lead all souls to heaven, especially those who are in most need of Thy mercy.",
      image: "/prayer-cards/fatima.jpg",
      caption: "Our Lady of Fatima — Imp. FB Bonella, Milano",
      history: "According to Sister Lúcia's account of the approved apparitions at Fátima, this prayer was given by Our Lady to Lúcia, Francisco, and Jacinta on July 13, 1917. Our Lady instructed them to pray it after each mystery of the Rosary. It has since become a widely used, though optional, addition after each decade."
    },
  ],
  "Intercessory": [
    {
      name: "Prayer to St. Michael",
      text: "Saint Michael the Archangel, defend us in battle. Be our defense against the wickedness and snares of the devil. May God rebuke him, we humbly pray; and do thou, O Prince of the heavenly host, by the power of God, thrust into Hell Satan and all the evil spirits who prowl about the world for the ruin of souls. Amen.",
      image: "/prayer-cards/st-michael.jpg",
      caption: "St. Michael the Archangel Defeating Satan — Guido Reni, c. 1630–1635",
      history: "Pope Leo XIII added this prayer to the Leonine Prayers in 1886, two years after those prayers had been instituted for recitation after Low Mass. A later tradition connects its composition with a frightening vision reportedly experienced by the Pope, although the historical evidence for that account is uncertain. The Leonine Prayers ceased to be required after Mass in 1964, though the Prayer to St. Michael remains a popular Catholic prayer for spiritual protection."
    },
    {
      name: "Prayer of St. Francis",
      text: "Lord, make me an instrument of Your peace. Where there is hatred, let me sow love; where there is injury, pardon; where there is doubt, faith; where there is despair, hope; where there is darkness, light; and where there is sadness, joy. O Divine Master, grant that I may not so much seek to be consoled as to console; to be understood as to understand; to be loved as to love; for it is in giving that we receive; it is in pardoning that we are pardoned; and it is in dying that we are born to eternal life. Amen.",
      image: "/prayer-cards/st-francis.jpg",
      caption: "Saint Francis of Assisi — School of Francisco de Zurbarán, c. 1600–1644",
      history: "Though attributed to Saint Francis of Assisi, this anonymous prayer first appeared in France in 1912 and was popularized during World War I. Its earliest known publication was in the French spiritual magazine La Clochette. Although Saint Francis did not compose it, its message of peace, forgiveness, and self-giving is consistent with Franciscan spirituality."
    },
    {
      name: "Prayer to St. Jude",
      text: "Most holy apostle, Saint Jude, faithful servant and friend of Jesus, the Church honors and invokes you universally as the patron of hopeless cases, of things almost despaired of. Pray for me, I am so helpless and alone. Make use, I implore you, of that particular privilege given to you, to bring visible and speedy help where help is almost despaired of. Come to my assistance in this great need, that I may receive the consolation and help of heaven in all my necessities, tribulations, and sufferings, particularly (here make your request), and that I may praise God with you and all the elect forever. Amen.",
      image: "/prayer-cards/st-jude.jpg",
      caption: "Saint Jude Thaddaeus — Jusepe de Ribera, c. 1607–1609",
      history: "Saint Jude Thaddaeus was one of the Twelve Apostles and is traditionally identified with Jude, the author named in the New Testament Epistle of Jude. He became widely invoked as the patron saint of desperate or seemingly hopeless causes. One popular explanation is that Christians were once hesitant to invoke him because his name resembled that of Judas Iscariot, although the historical origin of his patronage is uncertain. His feast is celebrated on October 28."
    },
    {
      name: "Anima Christi",
      text: "Soul of Christ, sanctify me. Body of Christ, save me. Water from the side of Christ, wash me. Passion of Christ, strengthen me. Good Jesus, hear me. Within your wounds, shelter me. From turning away, keep me. From the evil one, protect me. At the hour of my death, call me. Into your presence lead me, to praise you with all your saints, forever and ever. Amen.",
      image: "/prayer-cards/anima-christi.jpg",
      caption: "The Last Supper — Leonardo da Vinci, c. 1495–1498",
      history: "Latin for 'Soul of Christ,' this prayer dates to the early fourteenth century and was already well known long before Saint Ignatius of Loyola included it in his Spiritual Exercises. Medieval manuscripts associated indulgences with its recitation, although later claims connecting its origin or indulgence specifically to Pope John XXII are uncertain. The prayer meditates upon Christ's body, blood, wounds, and Passion through a series of intimate petitions."
    },
    {
      name: "Suscipe",
      text: "Take, Lord, and receive all my liberty, my memory, my understanding, and my entire will, all that I have and possess. You have given all to me; to you, Lord, I return it. All is yours; dispose of it wholly according to your will. Give me your love and your grace, for this is sufficient for me.",
      image: "/prayer-cards/st-ignatius.jpg",
      caption: "Miracles of Saint Ignatius of Loyola — Peter Paul Rubens, c. 1617–1618",
      history: "Latin for 'Take and receive,' this is Saint Ignatius of Loyola's prayer of total surrender, found near the conclusion of his Spiritual Exercises in the Contemplation to Attain Love. It is considered one of the most complete prayers of self-offering in Christian tradition, surrendering memory, understanding, and will — the three faculties of the soul — entirely to God."
    },
    {
      name: "Prayer Before a Crucifix",
      text: "Behold, O kind and most sweet Jesus, I cast myself upon my knees in your sight, and with the most fervent desire of my soul I pray and beseech you to impress upon my heart lively sentiments of faith, hope, and charity, true repentance for my sins, and a firm purpose of amendment, while with deep affection and grief of soul I ponder within myself and mentally contemplate your five most precious wounds, having before my eyes that which David spoke in prophecy of you, O good Jesus: 'They have pierced my hands and feet, they have numbered all my bones.' Amen.",
      image: "/prayer-cards/christ-crucified.jpg",
      caption: "Crucifixion of Jesus — Juan Sánchez Cotán, after 1603",
      history: "This prayer is traditionally prayed after receiving Holy Communion while kneeling before an image of Christ crucified. It meditates upon Christ's wounds and echoes Psalm 22. Under the Church's current discipline, praying it after Communion before a crucifix carries a partial indulgence; on Fridays during Lent, a plenary indulgence may be obtained under the usual conditions."
    },
  ],
  "For Others": [
    {
      name: "Prayer for the Sick",
      text: "O God, your Son accepted our sufferings to teach us the virtue of patience in human illness. Hear the prayers we offer for our sick brothers and sisters. May all who suffer pain, illness, or disease realize that they are chosen to be saints, and know that they are joined to Christ in his suffering for the salvation of the world, who lives and reigns with you and the Holy Spirit, one God, forever and ever. Amen.",
      image: "/prayer-cards/healing.jpg",
      caption: "Christ Healing the Paralytic at Bethesda — Bartolomé Esteban Murillo, c. 1667–1670",
      history: "Rooted in the Church's tradition of anointing the sick (James 5:14-15), this prayer reflects the Catholic understanding that suffering united to Christ's passion has redemptive value. The Second Vatican Council reaffirmed that the sick are called to participate in Christ's saving work through their suffering."
    },
    {
      name: "Prayer for the Faithful Departed",
      text: "God, Creator and Redeemer of all the faithful, grant to the souls of your servants and handmaids the forgiveness of all their sins. Through our devout prayers may they obtain the pardon which they have always desired. We ask this through Christ our Lord. Amen.",
      image: "/prayer-cards/faithful-departed.jpg",
      caption: "The Last Judgment — Fra Angelico, c. 1435–1440",
      history: "Rooted in the ancient Jewish practice of praying for the dead (2 Maccabees 12:46), this prayer reflects the Catholic doctrine of Purgatory — the belief that souls being purified can be helped by the prayers of the living. All Souls' Day (November 2) is dedicated entirely to praying for the faithful departed."
    },
    {
      name: "Eternal Rest",
      text: "Eternal rest grant unto them, O Lord, and let perpetual light shine upon them. May they rest in peace. Amen.",
      image: "/prayer-cards/eternal-rest.jpg",
      caption: "Madonna and Child with Souls in Purgatory — Luca Giordano, c. 1665",
      history: "Known in Latin as Requiem aeternam, this traditional prayer asks God to grant eternal rest and perpetual light to the faithful departed. Its language is rooted in 4 Esdras 2:34–35 and forms the opening antiphon of the traditional Requiem Mass. It has long held a central place in the Western Church's prayers and liturgy for the dead."
    },
  ],
  "Litany": [
    {
      name: "Litany of the Saints",
      text: "Lord, have mercy on us. Christ, have mercy on us. Lord, have mercy on us. Christ, hear us. Christ, graciously hear us. God the Father of Heaven, have mercy on us. God the Son, Redeemer of the world, have mercy on us. God the Holy Spirit, have mercy on us. Holy Trinity, one God, have mercy on us. Holy Mary, pray for us. Holy Mother of God, pray for us. Holy Virgin of Virgins, pray for us. Saint Michael, pray for us. Saint Gabriel, pray for us. Saint Raphael, pray for us. All you holy Angels and Archangels, pray for us. Saint John the Baptist, pray for us. Saint Joseph, pray for us. All you holy Patriarchs and Prophets, pray for us. Saint Peter, pray for us. Saint Paul, pray for us. Saint Andrew, pray for us. Saint John, pray for us. All you holy Apostles and Evangelists, pray for us. All you holy Disciples of the Lord, pray for us. All you holy Innocents, pray for us. Saint Stephen, pray for us. All you holy Martyrs, pray for us. Saint Gregory, pray for us. Saint Augustine, pray for us. All you holy Bishops and Confessors, pray for us. Saint Benedict, pray for us. Saint Francis, pray for us. All you holy Priests and Levites, pray for us. Saint Mary Magdalene, pray for us. Saint Agnes, pray for us. Saint Cecilia, pray for us. Saint Clare, pray for us. All you holy Virgins and Widows, pray for us. All you holy Saints of God, pray for us. Christ, hear us. Christ, graciously hear us. Lord, have mercy on us. Christ, have mercy on us. Lord, have mercy on us.",
      image: "/prayer-cards/litany-saints.jpg",
      caption: "The Forerunners of Christ with Saints and Martyrs — Fra Angelico, c. 1423–1424",
      history: "One of the oldest forms of Christian prayer, litanies date to the 5th century in the Eastern Church and were widespread in Rome by the 7th century. The Litany of the Saints is sung at Baptisms, Holy Orders, and the Easter Vigil. It expresses the belief in the Communion of Saints — that the Church on earth, in purgatory, and in heaven are united in prayer."
    },
  ],
}

function Prayers() {
  const [category, setCategory] = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const el = document.querySelector('.page-content')
    if (el) el.scrollTop = 0
  }, [category, selected])

  useEffect(() => {
    if (category && PRAYERS[category]) {
      PRAYERS[category].forEach(prayer => {
        if (prayer.image) {
          const img = new Image()
          img.src = prayer.image
        }
      })
    }
  }, [category])

  function selectCategory(cat) {
    setCategory(cat)
  }

  function selectPrayer(prayer) {
    setSelected(prayer)
  }

  function backFromPrayer() {
    setSelected(null)
  }

  function backFromCategory() {
    setCategory(null)
  }

  if (selected) {
    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={backFromPrayer} />
          <p className="readings-eyebrow">{category}</p>
          <h1 className="struggle-category-title">{selected.name}</h1>
        </div>
        <div className="page-content">
          {selected.image && (
            <div className="prayer-image-block">
              <img
                src={selected.image}
                alt={selected.name}
                className="prayer-image"
              />
              {selected.caption && (
                <p className="prayer-image-caption">{selected.caption}</p>
              )}
            </div>
          )}
          <div className="prayer-detail-card">
            <p className="prayer-detail-text">{selected.text}</p>
          </div>
          {selected.history && (
            <div className="prayer-history-card">
              <p className="prayer-history-label">About this Prayer</p>
              <p className="prayer-history-text">{selected.history}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (category) {
    return (
      <div className="page">
        <div className="page-header">
          <BackButton onClick={backFromCategory} />
          <p className="readings-eyebrow">Prayers</p>
          <h1 className="struggle-category-title">{category}</h1>
        </div>
        <div className="page-content">
          <div className="prayers-items">
            {PRAYERS[category].map(prayer => (
              <button
                key={prayer.name}
                className="prayer-item-btn"
                onClick={() => selectPrayer(prayer)}
              >
                {prayer.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <BackButton />
        <p className="readings-eyebrow">Traditional Prayers</p>
        <h1 className="struggle-category-title">Prayers</h1>
      </div>
      <div className="page-content">
        <div className="prayers-category-grid">
          {Object.keys(PRAYERS).map(cat => (
            <button
              key={cat}
              className="prayers-category-btn"
              onClick={() => selectCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Prayers
